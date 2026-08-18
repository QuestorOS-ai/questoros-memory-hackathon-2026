# Devpost Submission Copy — QuestorOS Memory — ICARE³ Organizational Intelligence

## Project title

QuestorOS Memory — ICARE³ Organizational Intelligence

## Public source repository

https://github.com/QuestorOS-ai/questoros-memory-hackathon-2026

## Functional demo

https://www.questoros.ai/icare3-judge-demo

## Demo video

<PASTE_PUBLIC_YOUTUBE_OR_VIMEO_URL_HERE>

## Short description

QuestorOS Memory is an agentic persistent-memory layer for organizational intelligence. It preserves context, decisions, corrections, provenance, and outcomes so AI agents can retrieve durable organizational knowledge instead of starting from scratch in every session.

The live judge demo uses only synthetic Harborview Tower data and demonstrates database readiness, scoped authentication, persistent memory creation, 1,024-dimension embedding generation, explainable retrieval, governed correction with immutable revision history, and deletion.

## What we built

QuestorOS Memory implements the durable-memory layer of the ICARE³ lifecycle: Issue → Context → Analysis → Recommendations → Human Evaluation → Execution → Outcome Evaluation.

For the hackathon, the standalone memory service was implemented around CockroachDB and AWS. CockroachDB stores memories, revision history, and 1,024-dimension vectors. Amazon Bedrock Titan Text Embeddings V2 generates semantic embeddings. The Memory API provides scoped persistence, explainable retrieval, correction, revision history, and deletion. The deployed staging API runs on AWS Lambda behind API Gateway.

The broader QuestorOS product existed before the hackathon. The standalone CockroachDB/AWS memory service and its portable judge/developer interfaces are the hackathon implementation. See `docs/pre-existing-work.md` in the public repository.

## CockroachDB tools used

### 1. Distributed Vector Indexing

Distributed Vector Indexing is part of the live memory retrieval path. The application persists 1,024-dimension embeddings in CockroachDB `VECTOR` columns, creates a tenant-prefixed native `VECTOR INDEX` using `vector_cosine_ops`, and retrieves authorized memories with cosine distance using the `<=>` operator. The returned search result includes vector similarity, authorized scope, keyword overlap, and human-readable retrieval reasons.

### 2. CockroachDB Cloud Managed MCP Server

The CockroachDB Cloud Managed MCP Server was used as a read-only AI/development and verification interface during implementation and QA. The agent used it for schema inspection, database diagnostics, verification of memory/vector structures and indexes, retrieval verification, and query/index recommendations. Application writes and migrations remain on the scoped application database connection rather than granting the MCP administrative write access.

A credential-free example MCP configuration is included at `.cursor/mcp.example.json`, and `docs/cockroachdb-tools.md` explains the separation between the Managed MCP development interface and the customer-facing memory service.

## AWS services used

- **AWS Lambda** — runs the isolated staging Memory REST API.
- **Amazon API Gateway HTTP API** — HTTP front door for the staging Memory API.
- **Amazon Bedrock Titan Text Embeddings V2** — generates normalized 1,024-dimension embeddings for CockroachDB vector retrieval.
- **AWS Secrets Manager** — keeps the CockroachDB connection string and judge credential out of source code in the deployment pattern.

The private staging implementation also uses bounded Amazon Bedrock Nova Micro reasoning for a proposal-only governed-harvest path, but the submitted judge flow does not depend on that private extra feature.

## Judge testing instructions

1. Open `https://www.questoros.ai/icare3-judge-demo`.
2. Click **Check CockroachDB**. A successful response shows `ok: true`, `databaseConnectivity: "verified by /readyz"`, and upstream `status: "ok"`.
3. Paste the separately supplied least-privilege judge key into the masked **Private judge demo key** field.
4. Click **Verify access** and confirm the synthetic tenant/actor scope and permissions.
5. Click **Store memory**. A new synthetic Harborview Tower memory and first revision are created.
6. Click **Generate vector**. Confirm Amazon Bedrock/Titan metadata and `dimensions: 1024`.
7. Click **Retrieve + explain**. Confirm the newly created memory is returned with the run-specific marker, matched scope, vector/relevance components, final score, and reasons.
8. Click **Correct memory**. The fictional deadline changes from July 15, 2026 to August 20, 2026 with a correction reason.
9. Click **Show revisions**. Confirm the original and corrected versions are both preserved.
10. Click **Delete demo memory**. Confirm the disposable memory is removed/soft-deleted and its embedding is deleted.

### Private judge key

Paste the dedicated least-privilege judge key only into Devpost's private testing instructions or other judge-only field:

`<PASTE_DEDICATED_LEAST_PRIVILEGE_JUDGE_KEY_HERE>`

Do **not** publish this key in the repository, project description, video, screenshots, or comments.

## Open-source license

Apache License 2.0. The `LICENSE` file is included at repository root.

## Security and data boundary

The public repository and demo use synthetic data only. They do not include QuestorOS production data, MemoryOS customer data, AWS access keys, a live CockroachDB connection string, a real Managed MCP cluster ID, the live judge credential, or private QuestorOS/MemoryOS Git history.

## Final submission checklist

- [x] Public open-source repository
- [x] Apache 2.0 license
- [x] Source code and dependency manifest
- [x] README/setup/configuration examples
- [x] CockroachDB Distributed Vector Indexing documented and implemented
- [x] CockroachDB Cloud Managed MCP usage documented
- [x] AWS Lambda/API Gateway/Bedrock deployment path documented and reproducible
- [x] Public functional demo
- [x] Public CockroachDB readiness check
- [ ] Authenticated end-to-end eight-step judge test
- [ ] Final live demo video under three minutes
- [ ] Public YouTube or Vimeo video URL
- [ ] Dedicated judge key pasted into judge-only testing instructions
- [ ] Devpost submission form updated and saved
