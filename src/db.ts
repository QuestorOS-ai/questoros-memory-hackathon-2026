import pg from 'pg';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and use a dedicated CockroachDB demo database.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export async function ready(): Promise<boolean> {
  const result = await pool.query('SELECT 1 AS ready');
  return result.rows[0]?.ready === 1;
}

export function vectorLiteral(values: number[]): string {
  if (values.length !== 1024) {
    throw new Error(`Expected a 1024-dimension embedding, received ${values.length}.`);
  }
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('Embedding contains a non-finite value.');
  }
  return `[${values.join(',')}]`;
}
