# Security

This repository is a public hackathon reference implementation. Treat every value in `.env.example` as a placeholder.

## Never commit

- `DATABASE_URL` values
- AWS access keys, secret keys, session tokens, or profiles
- live `qmem_live_...` API keys
- customer documents or customer memory records
- QuestorOS/MemoryOS production credentials

## Recommended judge deployment

- use a dedicated CockroachDB demo database/cluster;
- use only synthetic data;
- use a least-privilege AWS role limited to the required Bedrock model;
- use a unique judge bearer key;
- rotate/revoke the key after judging;
- keep the demo tenant/workspace separate from production tenants.

## Reporting

Do not open a public GitHub issue containing a credential or exploitable secret. Revoke/rotate the credential first and contact the repository owner privately.
