# Pre-existing Work Disclosure

The broader QuestorOS product existed before this hackathon and included internal concepts around context, memory, conversations, agents, and organizational intelligence.

This public repository is intentionally separated from that proprietary application. It contains the standalone judge/reference implementation of the hackathon Memory work:

- CockroachDB-backed persistent memory storage;
- `VECTOR(1024)` embeddings and tenant-prefixed vector indexing;
- Amazon Bedrock Titan embedding integration;
- scoped bearer authentication;
- explainable vector retrieval and provenance;
- corrections with immutable revision history;
- deletion controls; and
- a standalone browser judge flow.

The proprietary `QuestorOS-ai/questor-os` repository, private MemoryOS implementation history, production integrations, customer data, and production credentials are not included here and are not required to run this reference implementation.

This repository was created with fresh public Git history for judging. It does not publish the history of the private development repositories.
