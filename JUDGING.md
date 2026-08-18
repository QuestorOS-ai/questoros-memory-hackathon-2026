# Judge Verification Guide

## Live demo

Open:

**https://www.questoros.ai/icare3-judge-demo**

The deployed page is public. The first CockroachDB readiness action requires no key; the remaining memory operations use the separately supplied least-privilege staging judge key.

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

## Data policy

All example content is synthetic. The repository contains no production credentials, customer data, proprietary QuestorOS application source, or private Git history.

## License

Apache License 2.0. See `LICENSE`.
