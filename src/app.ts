import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Fastify from 'fastify';
import { z } from 'zod';
import { authenticate } from './auth.js';
import { pool, ready, vectorLiteral } from './db.js';
import { embedText } from './embedding.js';
import { explainRetrieval, keywordScore } from './scoring.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const judgeHtmlPath = path.resolve(root, '../apps/judge-demo/public/index.html');

const createSchema = z.object({
  memoryType: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(20_000),
  icareStage: z.string().min(1).max(80),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

const searchSchema = z.object({
  queryText: z.string().min(1).max(4000),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

const correctionSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(20_000),
  reason: z.string().min(1).max(2000),
  icareStage: z.string().min(1).max(80),
});

function identityFor(request: { headers: { authorization?: string } }) {
  return authenticate(request.headers.authorization);
}

export function buildApp(options: { serveJudgeUi?: boolean } = {}) {
  const app = Fastify({ logger: true, bodyLimit: 64 * 1024 });

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = Number((error as { statusCode?: number }).statusCode || 500);
    const safeMessage = error.message.replace(/qmem_live_[A-Za-z0-9_-]+/g, '[REDACTED]');
    reply.code(statusCode).send({ ok: false, error: safeMessage });
  });

  if (options.serveJudgeUi !== false) {
    app.get('/', async (_request, reply) => {
      const html = await readFile(judgeHtmlPath, 'utf8');
      return reply.type('text/html; charset=utf-8').header('cache-control', 'no-store').send(html);
    });
  }

  app.get('/readyz', async (_request, reply) => {
    try {
      const databaseReady = await ready();
      if (!databaseReady) {
        return reply.code(503).send({ status: 'not_ready', database: 'unreachable' });
      }
      return reply.send({ status: 'ok', database: 'cockroachdb' });
    } catch {
      return reply.code(503).send({ status: 'not_ready', database: 'unreachable' });
    }
  });

  app.get('/v1/whoami', async (request) => identityFor(request));

  app.post('/v1/memories', async (request) => {
    const identity = identityFor(request);
    const input = createSchema.parse(request.body);
    const workspaceId = identity.credentialScope.workspaceId;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const memoryResult = await client.query(
        `INSERT INTO memories
          (tenant_id, actor_id, workspace_id, project_id, memory_type, title, content, icare_stage, metadata)
         VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8::JSONB)
         RETURNING *`,
        [
          identity.tenantId,
          identity.actorId,
          workspaceId,
          input.memoryType,
          input.title,
          input.content,
          input.icareStage,
          JSON.stringify(input.metadata),
        ],
      );
      const memory = memoryResult.rows[0];
      const revisionResult = await client.query(
        `INSERT INTO memory_revisions
          (memory_id, version, title, content, icare_stage, reason)
         VALUES ($1, 1, $2, $3, $4, $5)
         RETURNING *`,
        [memory.id, input.title, input.content, input.icareStage, 'Initial memory creation'],
      );
      await client.query('COMMIT');
      return { id: memory.id, memory, revision: revisionResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  app.post('/v1/memories/:id/embedding/generate', async (request, reply) => {
    const identity = identityFor(request);
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const memoryResult = await pool.query(
      `SELECT * FROM memories
       WHERE id = $1 AND tenant_id = $2 AND workspace_id = $3 AND deleted_at IS NULL`,
      [params.id, identity.tenantId, identity.credentialScope.workspaceId],
    );
    const memory = memoryResult.rows[0];
    if (!memory) return reply.code(404).send({ ok: false, error: 'Memory not found.' });

    const embedding = await embedText(`${memory.title}\n\n${memory.content}`);
    const literal = vectorLiteral(embedding.vector);
    await pool.query(
      `UPSERT INTO memory_embeddings
        (memory_id, tenant_id, provider, model, dimensions, embedding, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::VECTOR(1024), now())`,
      [memory.id, identity.tenantId, embedding.provider, embedding.model, embedding.dimensions, literal],
    );

    return {
      ok: true,
      memoryId: memory.id,
      provider: embedding.provider,
      model: embedding.model,
      dimensions: embedding.dimensions,
      persistedIn: 'CockroachDB memory_embeddings',
    };
  });

  app.post('/v1/memories/search', async (request) => {
    const identity = identityFor(request);
    const input = searchSchema.parse(request.body);
    const queryEmbedding = await embedText(input.queryText);
    const literal = vectorLiteral(queryEmbedding.vector);

    const result = await pool.query(
      `SELECT
         m.*,
         e.provider AS embedding_provider,
         e.model AS embedding_model,
         e.dimensions AS embedding_dimensions,
         (1.0 - (e.embedding <=> $1::VECTOR(1024)))::FLOAT8 AS vector_similarity
       FROM memory_embeddings AS e
       JOIN memories AS m
         ON m.id = e.memory_id
        AND m.tenant_id = e.tenant_id
       WHERE e.tenant_id = $2
         AND m.tenant_id = $2
         AND m.workspace_id = $3
         AND m.deleted_at IS NULL
       ORDER BY e.embedding <=> $1::VECTOR(1024)
       LIMIT $4`,
      [literal, identity.tenantId, identity.credentialScope.workspaceId, input.limit],
    );

    return {
      query: input.queryText,
      retrievalMode: 'CockroachDB VECTOR(1024) cosine distance + explainable keyword score',
      results: result.rows.map((row) => {
        const keyword = keywordScore(input.queryText, row.title, row.content);
        const explanation = explainRetrieval({
          vectorSimilarity: Number(row.vector_similarity),
          keywordScore: keyword,
          tenantId: row.tenant_id,
          workspaceId: row.workspace_id,
          projectId: row.project_id,
        });
        return {
          id: row.id,
          memoryType: row.memory_type,
          title: row.title,
          content: row.content,
          icareStage: row.icare_stage,
          metadata: row.metadata,
          version: Number(row.version),
          provenance: {
            actorId: row.actor_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            embeddingProvider: row.embedding_provider,
            embeddingModel: row.embedding_model,
            embeddingDimensions: Number(row.embedding_dimensions),
          },
          explanation,
        };
      }),
    };
  });

  app.post('/v1/memories/:id/corrections', async (request, reply) => {
    const identity = identityFor(request);
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const input = correctionSchema.parse(request.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const existingResult = await client.query(
        `SELECT * FROM memories
         WHERE id = $1 AND tenant_id = $2 AND workspace_id = $3 AND deleted_at IS NULL
         FOR UPDATE`,
        [params.id, identity.tenantId, identity.credentialScope.workspaceId],
      );
      const existing = existingResult.rows[0];
      if (!existing) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: 'Memory not found.' });
      }

      const nextVersion = Number(existing.version) + 1;
      const title = input.title || existing.title;
      const updatedResult = await client.query(
        `UPDATE memories
         SET title = $1, content = $2, icare_stage = $3, version = $4, updated_at = now()
         WHERE id = $5
         RETURNING *`,
        [title, input.content, input.icareStage, nextVersion, params.id],
      );
      const revisionResult = await client.query(
        `INSERT INTO memory_revisions
          (memory_id, version, title, content, icare_stage, reason)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [params.id, nextVersion, title, input.content, input.icareStage, input.reason],
      );
      await client.query('COMMIT');

      return {
        ok: true,
        memory: updatedResult.rows[0],
        revision: revisionResult.rows[0],
        previousVersion: Number(existing.version),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  app.get('/v1/memories/:id/revisions', async (request, reply) => {
    const identity = identityFor(request);
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const allowed = await pool.query(
      `SELECT id FROM memories
       WHERE id = $1 AND tenant_id = $2 AND workspace_id = $3`,
      [params.id, identity.tenantId, identity.credentialScope.workspaceId],
    );
    if (!allowed.rows[0]) return reply.code(404).send({ ok: false, error: 'Memory not found.' });

    const revisions = await pool.query(
      `SELECT * FROM memory_revisions WHERE memory_id = $1 ORDER BY version ASC`,
      [params.id],
    );
    return { memoryId: params.id, revisions: revisions.rows };
  });

  app.delete('/v1/memories/:id', async (request, reply) => {
    const identity = identityFor(request);
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const deleted = await client.query(
        `UPDATE memories
         SET deleted_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND workspace_id = $3 AND deleted_at IS NULL
         RETURNING id, deleted_at`,
        [params.id, identity.tenantId, identity.credentialScope.workspaceId],
      );
      if (!deleted.rows[0]) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ ok: false, error: 'Memory not found.' });
      }
      await client.query('DELETE FROM memory_embeddings WHERE memory_id = $1', [params.id]);
      await client.query('COMMIT');
      return { ok: true, memoryId: params.id, deletedAt: deleted.rows[0].deleted_at };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  return app;
}
