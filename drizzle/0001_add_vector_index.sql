-- pgvector HNSW index for cosine similarity search
-- This dramatically improves semantic search performance from O(n) to O(log n)
-- Requires pgvector extension to be enabled

-- Create HNSW index on chunk_embedding.embedding column for cosine distance
CREATE INDEX IF NOT EXISTS chunk_embedding_hnsw_idx 
  ON chunk_embedding 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Also add index on workspace_id for the join filter optimization
CREATE INDEX IF NOT EXISTS doc_workspace_type_idx 
  ON document (workspace_id, type);
