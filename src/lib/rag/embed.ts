import { openai, EMBEDDING_MODEL } from "@/lib/openai";

/**
 * Génère les embeddings pour un lot de textes.
 * L'API OpenAI accepte jusqu'à 2048 entrées par requête ; on batch par 100
 * pour rester sûr et limiter la mémoire.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const BATCH = 100;
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: slice,
    });
    for (const item of res.data) out.push(item.embedding);
  }
  return out;
}

export async function embedOne(text: string): Promise<number[]> {
  const [vec] = await embedBatch([text]);
  return vec;
}

/** Sérialise un vecteur au format littéral pgvector : "[0.1,0.2,...]". */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
