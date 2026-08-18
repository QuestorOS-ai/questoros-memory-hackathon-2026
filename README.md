# QuestorOS Memory — ICARE³ Organizational Intelligence

QuestorOS Memory is a portable, explainable, user-controlled memory layer for AI agents. This public repository is the clean-room, judge-facing reference implementation for the 2026 hackathon submission.

It demonstrates a complete persistent-memory loop using **CockroachDB** for durable relational + vector storage and **Amazon Bedrock Titan Text Embeddings V2** for 1,024-dimension embeddings.

## Live functional demo

**https://www.questoros.ai/icare3-judge-demo**

The deployed judge page uses only synthetic Harborview Tower data and an isolated staging credential. No QuestorOS production data or MemoryOS customer data is used.

## Hackathon resources used

### CockroachDB tool 1 — Distributed Vector Indexing

This is part of the live memory retrieval path:

- memories and revisions persist in CockroachDB;
- embeddings persist in a native `VECTOR(1024)` column;
- the schema creates a tenant-prefixed native `VECTOR INDEX`;
- semantic retrieval executes in CockroachDB with cosine distance (`<=>`); and
- the returned result includes an explainable score and authorized scope.

See [`sql/schema.sql`](sql/schema.sql), [`src/server.ts`](src/server.ts), and [`docs/cockroachdb-tools.md`](docs/cockroachdb-tools.md).

### CockroachDB tool 2 — CockroachDB Cloud Managed MCP Server

The Cloud Managed MCP Server is used as a read-only AI/development and verification interface for:

- schema inspection;
- database diagnostics;
- retrieval verification;
- checking memory/vector tables and indexes; and
- index/query recommendations during implementation and QA.

Application writes and migrations remain on the scoped application database connection rather than giving the MCP administrative write authority. A credential-free example is included at [`.cursor/mcp.example.json`](.cursor/mcp.example.json). See [`docs/cockroachdb-tools.md`](docs/cockroachdb-tools.md).

### AWS services

The actual isolated staging Memory API is deployed on AWS. The implementation uses:

- **AWS Lambda** for the staging Memory REST API;
- **Amazon API Gateway HTTP API** as its staging HTTP front door;
- **Amazon Bedrock Titan Text Embeddings V2** for the 1,024-dimension memory embeddings; and
- **Amazon Bedrock Nova Micro** for bounded, proposal-only structured reasoning in the governed-harvest path.

AWS access is least-privilege and the judge demo does not expose AWS credentials.

## What the demo proves

1. Verify CockroachDB connectivity.
2. Authenticate a least-privilege judge identity.
3. Store a synthetic ICARE³ memory.
4. Generate and persist a 1,024-dimension embedding.
5. Retrieve the same memory through CockroachDB vector search.
6. Show an explainable score with vector similarity, keyword overlap, authorized scope, and reasons.
7. Correct the memory without erasing history.
8. Inspect immutable revisions.
9. Delete the disposable memory and its embedding.

## ICARE³ lifecycle

**Issue → Context → Analysis → Recommendations → Human Evaluation → Execution → Outcome Evaluation**

The reference implementation focuses on the durable-memory portion of that lifecycle: context, retrieval, provenance, correction, revision history, and deletion.

## Architecture

```text
Browser / AI agent
        |
        v
Fastify REST API
        |
        +--> scoped bearer authentication
        |
        +--> Amazon Bedrock Titan Text Embeddings V2
        |
        v
CockroachDB
  ├── memories
  ├── memory_revisions
  └── memory_embeddings VECTOR(1024)
          └── tenant-prefixed VECTOR INDEX
```

The vector retrieval query uses CockroachDB's cosine-distance operator (`<=>`) and keeps the query inside the authorized tenant/workspace scope.

## Requirements

- Node.js 22+
- A CockroachDB cluster/database
- AWS credentials with permission to invoke the configured Bedrock embedding model

## Setup

```bash
git clone https://github.com/QuestorOS-ai/questoros-memory-hackathon-2026.git
cd questoros-memory-hackathon-2026
npm install
cp .env.example .env
```

Fill in `.env` with a **dedicated demo CockroachDB connection string**, a judge API key, and your AWS region/model configuration.

Initialize the schema:

```bash
npm run db:init
```

Start the service:

```bash
npm start
```

Open:

```text
http://127.0.0.1:8788
```

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Dedicated CockroachDB connection string |
| `JUDGE_API_KEY` | Least-privilege bearer key used by the reference API |
| `DEMO_TENANT_ID` | Synthetic tenant scope |
| `DEMO_ACTOR_ID` | Synthetic judge actor |
| `DEMO_WORKSPACE_ID` | Synthetic workspace scope |
| `AWS_REGION` | AWS region for Bedrock |
| `BEDROCK_EMBEDDING_MODEL` | Titan embedding model ID |
| `BEDROCK_EMBEDDING_DIMENSIONS` | Fixed to `1024` for this demo |
| `PORT` | HTTP port, default `8788` |

Never commit a real database URL, AWS credential, CockroachDB cluster credential, or `qmem_live_...` judge key. `.env` files are ignored by Git.

## REST API

### Public readiness

```http
GET /readyz
```

Returns `200` only when the service can reach CockroachDB.

### Scoped identity

```http
GET /v1/whoami
Authorization: Bearer <judge-key>
```

### Create memory

```http
POST /v1/memories
Authorization: Bearer <judge-key>
Content-Type: application/json
```

Example body:

```json
{
  "memoryType": "DECISION",
  "title": "Harborview Tower closing deadline",
  "content": "The legacy closing deadline is July 15, 2026.",
  "icareStage": "CONTEXT",
  "metadata": { "synthetic": true }
}
```

### Generate embedding

```http
POST /v1/memories/:id/embedding/generate
Authorization: Bearer <judge-key>
```

### Explainable vector search

```http
POST /v1/memories/search
Authorization: Bearer <judge-key>
Content-Type: application/json
```

Example:

```json
{
  "queryText": "What is the Harborview Tower closing deadline?",
  "limit": 5
}
```

### Correct memory

```http
POST /v1/memories/:id/corrections
Authorization: Bearer <judge-key>
```

### Revision history

```http
GET /v1/memories/:id/revisions
Authorization: Bearer <judge-key>
```

### Delete memory

```http
DELETE /v1/memories/:id
Authorization: Bearer <judge-key>
```

## Source layout

```text
.cursor/mcp.example.json          # safe CockroachDB Cloud Managed MCP example
apps/judge-demo/public/index.html # browser proof flow
scripts/init-db.ts                # schema initializer
sql/schema.sql                    # CockroachDB tables + vector index
src/auth.ts                       # least-privilege demo authentication
src/db.ts                         # CockroachDB connection helpers
src/embedding.ts                  # Amazon Bedrock embedding adapter
src/scoring.ts                    # explainable retrieval scoring
src/server.ts                     # REST API + browser host
test/scoring.test.ts              # deterministic scoring tests
JUDGING.md                        # judge verification instructions
docs/cockroachdb-tools.md         # required CockroachDB tool usage
docs/pre-existing-work.md         # disclosure boundary
```

## Development checks

```bash
npm run typecheck
npm test
```

A GitHub Actions workflow is included to run these checks on pushes and pull requests. During this submission-preparation session, the connector did not surface a completed Actions run, so this README does not claim that CI has passed.

## Security boundary

This repository intentionally does **not** contain:

- the proprietary `questor-os` application repository;
- private QuestorOS/MemoryOS Git history;
- customer data;
- production database credentials;
- AWS secret/access keys;
- live judge credentials;
- raw administrative database tooling; or
- a real CockroachDB Managed MCP cluster ID or credential.

It is a standalone judge/reference implementation of the submitted Memory functionality.

## Pre-existing work disclosure

The broader QuestorOS product existed before the hackathon and included internal memory/context concepts. This public repository contains the standalone CockroachDB/AWS agentic-memory implementation and judge reference flow prepared for the hackathon submission. See [`docs/pre-existing-work.md`](docs/pre-existing-work.md).

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
