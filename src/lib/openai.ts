import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  // En build Vercel la clé peut être absente ; on n'échoue qu'à l'usage.
  console.warn("[openai] OPENAI_API_KEY manquante");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

/** Dimension du vecteur d'embedding (doit matcher la colonne pgvector). */
export const EMBEDDING_DIM = 1536;
