# Devpost Submission — QuestorOS Memory — ICARE³ Organizational Intelligence

## Project title
QuestorOS Memory — ICARE³ Organizational Intelligence

## Tagline
Persistent, explainable organizational memory for AI agents using CockroachDB vector indexing and AWS Bedrock.

## Public source repository
https://github.com/QuestorOS-ai/questoros-memory-hackathon-2026

## Functional demo
https://www.questoros.ai/icare3-judge-demo

## Demo video
PUBLIC_YOUTUBE_OR_VIMEO_URL_AFTER_UPLOAD

## What it does
QuestorOS Memory gives AI agents durable organizational memory instead of disposable chat context. It stores governed memories and immutable revisions, creates semantic embeddings, retrieves memories through scoped vector search, explains why a result matched, preserves correction history, and lets users delete disposable memory. The ICARE³ lifecycle connects Issue → Context → Analysis → Recommendations → Human Evaluation → Execution → Outcome Evaluation so knowledge can improve across agent interactions without silently overwriting prior context.

The live judge demo uses only synthetic Harborview Tower data. It verifies CockroachDB connectivity, creates a memory, generates a 1,024-dimension Amazon Titan embedding, retrieves that memory with explainable vector search, corrects a fictional deadline while preserving history, displays revisions, and deletes the disposable record.

## How CockroachDB is used
### Tool 1 — Distributed Vector Indexing
CockroachDB is the persistent relational and vector memory layer. Memory content and revision history are stored in CockroachDB, while Amazon Bedrock Titan Text Embeddings V2 produces 1,024-dimension embeddings stored in a native VECTOR(1024) column. A tenant-prefixed native VECTOR INDEX using vector_cosine_ops supports scoped semantic retrieval. Retrieval uses CockroachDB cosine distance (<=>), with tenant/workspace constraints and an explainable final score.

### Tool 2 — CockroachDB Cloud Managed MCP Server
The CockroachDB Cloud Managed MCP Server is used as a read-only AI development and verification interface. During implementation and QA, the agent uses it for schema inspection, database diagnostics, memory/vector table and index verification, retrieval checks, and query/index recommendations. Writes and migrations remain on the controlled application database connection rather than granting the MCP administrative write access.

## How AWS is used
The isolated staging Memory API runs on AWS Lambda behind Amazon API Gateway. Amazon Bedrock Titan Text Embeddings V2 generates the 1,024-dimension memory vectors used by CockroachDB retrieval. The private staging implementation also uses bounded Amazon Nova Micro reasoning in a governed proposal-only path. Database configuration and judge credentials are kept out of source and supplied through secure secret configuration.

The public repository includes a safe AWS SAM template showing the Lambda + API Gateway + Bedrock deployment path without exposing the real AWS account, live secret values, or production infrastructure.

## Architecture
Browser / AI agent → scoped Memory API → Amazon Bedrock embeddings → CockroachDB relational + VECTOR(1024) memory store.

CockroachDB Managed MCP is kept separate as the read-only agent/development verification channel.

## Judge testing instructions
1. Open https://www.questoros.ai/icare3-judge-demo
2. Click **Check CockroachDB**. The response should show a successful CockroachDB-backed readiness check.
3. Enter the separately supplied least-privilege judge key in the masked **Private judge demo key** field.
4. Click **Verify access** and confirm the synthetic scoped identity/permissions.
5. Click **Store memory** and note the returned memory ID/revision.
6. Click **Generate vector** and confirm Amazon Bedrock Titan metadata and `dimensions: 1024`.
7. Click **Retrieve + explain** and confirm the newly created Harborview Tower memory is returned with vector similarity, matched scope, final score, and reasons.
8. Click **Correct memory**. The fictional deadline changes from July 15, 2026 to August 20, 2026 with a correction reason.
9. Click **Show revisions** to verify both versions remain visible.
10. Click **Delete demo memory** to remove the disposable demonstration record/vector.

The judge key must be supplied privately through the Devpost testing-access mechanism or other non-public judge instructions. Do not publish it in this repository, the video description, or public comments.

## Open-source license
Apache License 2.0.

## Pre-existing work disclosure
QuestorOS existed before the hackathon and included broader product-level context and memory concepts. The submitted work is the standalone CockroachDB/AWS agentic-memory implementation and the judge-facing ICARE³ memory flow represented in this public repository. The proprietary QuestorOS application, private MemoryOS history, production/customer data, and credentials are not included.

## Security / privacy
The demo uses synthetic data only. The public repository contains no customer memories, production QuestorOS data, live AWS credentials, database connection strings, real CockroachDB Managed MCP cluster ID, or live judge key.

## Video checklist
The final public video should remain under 3 minutes and visibly show the live application functioning: address bar/title, CockroachDB readiness, scoped access, memory creation, 1,024-dimension vector generation, explainable retrieval, correction, revisions, and deletion. Use the generated narration/captions over the continuous proof footage.
