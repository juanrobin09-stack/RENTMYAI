import { EMBEDDING_MODEL, EMBEDDING_DIM } from "@/lib/ai";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

/**
 * Génère les embeddings d'un lot de textes via l'API Voyage AI.
 * `input_type` distingue document (indexation) et query (recherche) pour
 * améliorer le rappel. Batch par 128 (limite raisonnable Voyage).
 */
async function callVoyage(
  texts: string[],
  inputType: "document" | "query",
): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error("VOYAGE_API_KEY est manquante");

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      input_type: inputType,
      output_dimension: EMBEDDING_DIM,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Voyage API error (${res.status}): ${detail}`);
  }
  const json = (await res.json()) as VoyageResponse;
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/** Embeddings de documents (indexation RAG). */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const BATCH = 128;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    out.push(...(await callVoyage(slice, "document")));
  }
  return out;
}

/** Embedding d'une requête de recherche. */
export async function embedOne(text: string): Promise<number[]> {
  const [vec] = await callVoyage([text], "query");
  return vec;
}

/** Sérialise un vecteur au format littéral pgvector : "[0.1,0.2,...]". */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
