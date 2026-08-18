CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id STRING NOT NULL,
  actor_id STRING NOT NULL,
  workspace_id STRING NULL,
  project_id STRING NULL,
  memory_type STRING NOT NULL,
  title STRING NOT NULL,
  content STRING NOT NULL,
  icare_stage STRING NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  version INT8 NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX memories_scope_idx (tenant_id, workspace_id, project_id, deleted_at)
);

CREATE TABLE IF NOT EXISTS memory_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  version INT8 NOT NULL,
  title STRING NOT NULL,
  content STRING NOT NULL,
  icare_stage STRING NOT NULL,
  reason STRING NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (memory_id, version)
);

CREATE TABLE IF NOT EXISTS memory_embeddings (
  memory_id UUID PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE,
  tenant_id STRING NOT NULL,
  provider STRING NOT NULL,
  model STRING NOT NULL,
  dimensions INT8 NOT NULL,
  embedding VECTOR(1024) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CockroachDB Distributed Vector Indexing.
-- Tenant is the equality prefix used for isolation; vector_cosine_ops matches
-- the <=> cosine-distance retrieval query in src/server.ts.
CREATE VECTOR INDEX IF NOT EXISTS memory_embeddings_vector_idx
  ON memory_embeddings (tenant_id, embedding vector_cosine_ops);
