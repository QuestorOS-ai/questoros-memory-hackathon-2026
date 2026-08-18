# CockroachDB tools used in the hackathon

QuestorOS Memory meaningfully uses two of the CockroachDB tools identified by the hackathon rules.

## 1. CockroachDB Distributed Vector Indexing

Distributed Vector Indexing is part of the runtime memory path, not a decorative integration.

- Durable memories are stored in CockroachDB.
- `memory_embeddings.embedding` is a native `VECTOR(1024)` column.
- The schema creates a tenant-prefixed native vector index.
- Amazon Bedrock Titan Text Embeddings V2 produces the 1,024-dimension vectors.
- Semantic retrieval runs inside CockroachDB with the cosine-distance operator `<=>`.
- Retrieval is constrained by tenant/workspace scope before results are returned.
- The application combines the CockroachDB vector similarity with a transparent keyword component to produce the human-readable retrieval explanation shown in the judge demo.

See `sql/schema.sql` and `src/server.ts`.

## 2. CockroachDB Cloud Managed MCP Server

The CockroachDB Cloud Managed MCP Server is the administrative AI/development interface used during implementation and verification.

It is intentionally kept read-only and separate from the application write path. It is used for:

- schema inspection;
- database diagnostics;
- retrieval verification;
- checking memory/vector tables and indexes; and
- receiving index/query recommendations while developing and validating the memory layer.

Application writes and schema migrations use the scoped application CockroachDB connection instead of giving the MCP server unrestricted write authority. This keeps the AI-assisted database inspection boundary safer and auditable.

A safe configuration example is included at `.cursor/mcp.example.json`. It contains only the official Managed MCP endpoint and a placeholder cluster ID; no real cluster ID, token, database URL, or credential is committed.

## Separation from the customer-facing Memory MCP

The CockroachDB Cloud Managed MCP Server is an administrative development/verification tool. It is distinct from the QuestorOS Memory customer-facing MCP interface in the full implementation. The latter exposes controlled memory operations to AI agents rather than raw database administration.
