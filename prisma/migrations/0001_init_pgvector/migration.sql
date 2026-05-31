-- RentMyAI — activation pgvector + index de similarité
-- À exécuter après `prisma migrate` (la colonne `embedding` est gérée en raw SQL).

-- 1. Extension vector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Colonne embedding sur chunk (si non créée par Prisma)
--    Voyage AI voyage-3.5 => 1024 dimensions.
ALTER TABLE "chunk"
  ADD COLUMN IF NOT EXISTS "embedding" vector(1024);

-- 3. Index HNSW pour la recherche cosinus (rapide à grande échelle).
--    Alternative IVFFlat si volume modéré ; HNSW = meilleur rappel/latence.
CREATE INDEX IF NOT EXISTS "chunk_embedding_hnsw_idx"
  ON "chunk"
  USING hnsw ("embedding" vector_cosine_ops);
