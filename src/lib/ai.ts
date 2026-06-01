import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Provider Claude (Anthropic) pour le chat, via le Vercel AI SDK.
 * La clé est lue au runtime (ANTHROPIC_API_KEY).
 */
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/** Identifiants de modèles Claude exacts et stables (API publique). */
export const MODEL_HAIKU = "claude-3-5-haiku-20241022";
export const MODEL_SONNET = "claude-3-5-sonnet-20241022";

/** Modèle de chat par défaut si l'agent n'en précise pas. */
export const DEFAULT_CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? MODEL_HAIKU;

/** Modèles Claude proposés aux créateurs. */
export const CHAT_MODELS = [
  { value: MODEL_HAIKU, label: "Claude 3.5 Haiku (rapide, économique)" },
  { value: MODEL_SONNET, label: "Claude 3.5 Sonnet (qualité maximale)" },
] as const;

/**
 * Normalise le modèle stocké en un identifiant Anthropic valide.
 * Gère les anciens alias `-latest`, les anciens noms OpenAI, et tout
 * inconnu → on retombe sur un modèle stable. Évite les erreurs "model not found"
 * pour les agents déjà créés.
 */
export function resolveModel(model: string | null | undefined): string {
  if (!model) return DEFAULT_CHAT_MODEL;
  const m = model.toLowerCase();
  if (m.includes("sonnet")) return MODEL_SONNET;
  if (m.includes("haiku")) return MODEL_HAIKU;
  // gpt-* ou tout autre ancien modèle → défaut
  return DEFAULT_CHAT_MODEL;
}

// --- Embeddings (Voyage AI, recommandé par Anthropic) ---

export const EMBEDDING_MODEL =
  process.env.VOYAGE_EMBEDDING_MODEL ?? "voyage-3.5";

/** Dimension du vecteur Voyage (doit matcher la colonne pgvector). */
export const EMBEDDING_DIM = 1024;
