import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Provider Claude (Anthropic) pour le chat, via le Vercel AI SDK.
 * La clé est lue au runtime (ANTHROPIC_API_KEY).
 */
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/** Modèle de chat par défaut si l'agent n'en précise pas. */
export const DEFAULT_CHAT_MODEL =
  process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-latest";

/** Modèles Claude proposés aux créateurs. */
export const CHAT_MODELS = [
  { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku (rapide, économique)" },
  { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet (qualité maximale)" },
] as const;

// --- Embeddings (Voyage AI, recommandé par Anthropic) ---

export const EMBEDDING_MODEL =
  process.env.VOYAGE_EMBEDDING_MODEL ?? "voyage-3.5";

/** Dimension du vecteur Voyage (doit matcher la colonne pgvector). */
export const EMBEDDING_DIM = 1024;
