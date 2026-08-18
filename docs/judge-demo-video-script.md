# Judge Demo Video Script

Target finished length: **under 3 minutes**.

The proof section must be real screen footage of the deployed application functioning. Do not substitute generated UI, screenshots, or animation for the live actions.

## 0:00–0:08 — Establish the app

Show the browser address bar and `QuestorOS Memory — ICARE³ Judge Demo`.

Narration: QuestorOS Memory turns AI context, decisions, corrections, and outcomes into durable organizational intelligence.

## 0:08–0:18 — CockroachDB readiness

Click **Check CockroachDB** and pause on the successful response.

Narration: The live readiness probe confirms the Memory API can reach its CockroachDB-backed memory store before we create any data.

## 0:18–0:28 — Scoped access

Paste the key into the masked field and click **Verify access**.

Narration: The judge credential is scoped and permission constrained, and the demonstration uses only synthetic data.

## 0:28–0:42 — Store memory

Click **Store memory** and pause on the new ID/revision.

Narration: We store synthetic Harborview Tower context with a unique marker and revision history.

## 0:42–0:53 — Generate vector

Click **Generate vector** and pause on provider/model/dimensions.

Narration: Amazon Bedrock Titan generates a 1,024-dimension embedding that is persisted alongside the memory.

## 0:53–1:08 — Retrieve + explain

Click **Retrieve + explain** and pause on the same unique marker plus explanation fields.

Narration: CockroachDB vector search retrieves the same memory and explains the result using vector similarity, keyword evidence, authorized scope, and a final score.

## 1:08–1:22 — Correct memory

Click **Correct memory**.

Narration: New evidence changes the fictional deadline from July fifteenth to August twentieth without silently overwriting the old knowledge.

## 1:22–1:36 — Revision history

Click **Show revisions** and show both versions.

Narration: The correction trail preserves both versions so future agents can distinguish current knowledge from superseded context.

## 1:36–1:47 — Delete

Click **Delete demo memory**.

Narration: Finally, the disposable memory and embedding are removed under user control.

## 1:47–1:57 — Close

Show the ICARE³ lifecycle.

Narration: ICARE³ connects issue, context, analysis, recommendations, human evaluation, execution, and outcome evaluation so organizational intelligence persists beyond a single chat.

## Recording rules

- Keep the address bar visible at the start.
- Keep the private key masked.
- Do not show `.env`, AWS credentials, database credentials, private GitHub pages, customer files, or production administration screens.
- Keep the live API evidence legible at 1080p.
- The final video must preserve the live CockroachDB readiness, write, vector generation, retrieval, correction/revisions, and deletion actions.
