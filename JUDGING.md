# Judge Verification Guide

## Live demo

Open:

**https://www.questoros.ai/icare3-judge-demo**

The deployed page is public. The first CockroachDB readiness action requires no key; the remaining memory operations use the separately supplied least-privilege staging judge key.

## Required platform integrations

### CockroachDB Distributed Vector Indexing

This is in the live memory data path. Memories and revisions are persisted in CockroachDB, Amazon Bedrock generates 1,024-dimension vectors, the vectors are stored in `VECTOR(1024)`, and semantic retrieval uses a tenant-prefixed CockroachDB vector index with `vector_cosine_ops` and cosine distance (`<=>`). The retrieved result is then presented with vector similarity, scope, and explainable scoring evidence.

### CockroachDB Cloud Managed MCP Server

This is the read-only AI development and verification path. During implementation and QA, the AI/development agent used the Managed MCP connection to inspect the CockroachDB schema, perform diagnostics, verify memory/vector retrieval structures, inspect indexes, and review query/index recommendations. Database mutations and migrations remain on the application connection rather than granting the MCP administrative write authority.

The safe placeholder configuration is at `.cursor/mcp.example.json`; it contains no real cluster ID or credential. See `docs/cockroachdb-tools.md` for the separation between CockroachDB Managed MCP and the customer-facing QuestorOS Memory MCP interface.

### AWS services

The isolated staging Memory API is deployed with **AWS Lambda** behind an **Amazon API Gateway HTTP API**. **Amazon Bedrock Titan Text Embeddings V2** generates the 1,024-dimension memory vectors. The public source includes the Lambda adapter (`src/lambda.ts`) and reproducible AWS SAM definition (`template.yaml`) with a least-privilege Titan `bedrock:InvokeModel` policy and Secrets Manager references for sensitive configuration.

The full private staging implementation contains additional bounded reasoning features, but they are not required to reproduce or judge the submitted store/embed/retrieve/correct/delete flow.

## Expected proof flow

1. **Check CockroachDB** — confirms the Memory API can reach its CockroachDB database.
2. **Verify access** — returns synthetic tenant/actor scope and permissions.
3. **Store memory** — creates a synthetic Harborview Tower memory and revision 1.
4. **Generate vector** — generates and stores a 1,024-dimension Amazon Titan embedding.
5. **Retrieve + explain** — retrieves the newly created memory and shows vector similarity, keyword overlap, matched scope, final score, and reasons.
6. **Correct memory** — updates the fictional deadline from July 15, 2026 to August 20, 2026 with a correction reason.
7. **Show revisions** — displays the original and corrected versions.
8. **Delete demo memory** — soft-deletes the memory and removes its embedding.

Every demo run uses a unique marker, making it clear that retrieval is returning the memory created in that same run rather than a prerecorded fixture.

## Run this repository locally

```bash
npm install
cp .env.example .env
# fill in dedicated demo values
npm run db:init
npm start
```

Then open `http://127.0.0.1:8788`.

## Deploy this repository on AWS

After creating dedicated Secrets Manager values for the CockroachDB URL and judge bearer key:

```bash
sam build
sam deploy --guided --region ap-southeast-1
```

The deployment uses `template.yaml`; no real AWS account identifiers or secret values are committed.

## Data policy

All example content is synthetic. The repository contains no production credentials, customer data, proprietary QuestorOS application source, or private Git history.

## License

Apache License 2.0. See `LICENSE`.
