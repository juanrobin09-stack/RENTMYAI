import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Provider Claude (Anthropic) pour le chat, via le Vercel AI SDK.
 * La clé est lue au runtime (ANTHROPIC_API_KEY).
 */
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/** Identifiants de modèles Claude (génération actuelle). */
export const MODEL_HAIKU = "claude-haiku-4-5-20251001";
export const MODEL_SONNET = "claude-sonnet-4-6";

/** Modèle de chat par défaut si l'agent n'en précise pas. */
export const DEFAULT_CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? MODEL_SONNET;

/** Modèles Claude proposés aux créateurs. */
export const CHAT_MODELS = [
  { value: MODEL_SONNET, label: "Claude Sonnet 4.6 (recommandé, qualité maximale)" },
  { value: MODEL_HAIKU, label: "Claude Haiku 4.5 (rapide, économique)" },
] as const;

/**
 * Normalise le modèle stocké en un identifiant Anthropic valide.
 * - IDs actuels → conservés tels quels
 * - "sonnet" → Sonnet 4.6
 * - "haiku" (génération actuelle) → Haiku 4.5
 * - tout le reste (anciens alias -latest, modèles 3.x obsolètes, gpt-*) → défaut
 * Évite les erreurs "model not found" pour les agents déjà créés.
 */
export function resolveModel(model: string | null | undefined): string {
  if (!model) return DEFAULT_CHAT_MODEL;
  if (model === MODEL_HAIKU || model === MODEL_SONNET) return model;
  const m = model.toLowerCase();
  if (m.includes("sonnet")) return MODEL_SONNET;
  if (m.includes("haiku") && m.includes("4-5")) return MODEL_HAIKU;
  return DEFAULT_CHAT_MODEL; // legacy/obsolète -> Sonnet 4.6
}

// --- Embeddings (Voyage AI, recommandé par Anthropic) ---

export const EMBEDDING_MODEL =
  process.env.VOYAGE_EMBEDDING_MODEL ?? "voyage-3.5";

/** Dimension du vecteur Voyage (doit matcher la colonne pgvector). */
export const EMBEDDING_DIM = 1024;
