import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../src/db.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const schema = await readFile(path.resolve(root, '../sql/schema.sql'), 'utf8');

try {
  await pool.query(schema);
  console.log('CockroachDB judge schema initialized.');
} finally {
  await pool.end();
}
