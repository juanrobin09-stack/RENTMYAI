import { db } from "@/lib/db";
import { embedOne, toVectorLiteral } from "./embed";

export interface RetrievedChunk {
  id: string;
  content: string;
  documentId: string;
  distance: number;
}

/**
 * Recherche de similarité pgvector pour un agent donné.
 * Utilise la distance cosinus (`<=>`). Plus la distance est faible, plus
 * le chunk est pertinent. On filtre par agentId pour isoler les KB.
 */
export async function retrieveContext(
  agentId: string,
  query: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const queryVec = await embedOne(query);
  const literal = toVectorLiteral(queryVec);

  const rows = await db.$queryRaw<RetrievedChunk[]>`
    SELECT
      "id",
      "content",
      "documentId",
      ("embedding" <=> ${literal}::vector) AS "distance"
    FROM "chunk"
    WHERE "agentId" = ${agentId}
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${literal}::vector
    LIMIT ${topK}
  `;

  return rows;
}

/**
 * Construit le bloc de contexte injecté dans le prompt système,
 * avec des marqueurs de source pour permettre les citations.
 */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  const sources = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n---\n\n");

  return `\n\n# Base de connaissances\nUtilise EN PRIORITÉ les extraits ci-dessous pour répondre. Si l'information n'y figure pas, dis-le honnêtement.\n\n${sources}`;
}
