import { db } from "@/lib/db";
import { chunkText } from "./chunk";
import { embedBatch, toVectorLiteral } from "./embed";
import { Prisma } from "@prisma/client";

/**
 * Pipeline d'ingestion RAG d'un document PDF.
 * Étapes : télécharger → parser (pdf-parse) → chunk → embed → stocker (pgvector).
 *
 * Idempotent par document : on purge les chunks existants avant ré-ingestion.
 * À appeler depuis le webhook UploadThing ou un job en arrière-plan.
 */
export async function ingestDocument(documentId: string): Promise<void> {
  const doc = await db.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error(`Document introuvable: ${documentId}`);

  await db.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING", error: null },
  });

  try {
    // 1. Télécharger le PDF depuis UploadThing.
    const res = await fetch(doc.fileUrl);
    if (!res.ok) throw new Error(`Téléchargement échoué (${res.status})`);
    const buffer = Buffer.from(await res.arrayBuffer());

    // 2. Extraire le texte. (import dynamique : pdf-parse est CJS only)
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = parsed.text ?? "";
    if (!text.trim()) throw new Error("PDF vide ou non lisible (scan image ?)");

    // 3. Chunking.
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("Aucun chunk généré");

    // 4. Embeddings.
    const vectors = await embedBatch(chunks.map((c) => c.content));

    // 5. Purge + insertion (raw SQL pour la colonne vector).
    await db.$transaction(async (tx) => {
      await tx.chunk.deleteMany({ where: { documentId } });

      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const vectorLiteral = toVectorLiteral(vectors[i]);
        await tx.$executeRaw`
          INSERT INTO "chunk" ("id", "documentId", "agentId", "content", "index", "tokens", "embedding", "createdAt")
          VALUES (
            ${cuid()},
            ${documentId},
            ${doc.agentId},
            ${c.content},
            ${c.index},
            ${c.tokens},
            ${vectorLiteral}::vector,
            now()
          )
        `;
      }

      await tx.document.update({
        where: { id: documentId },
        data: { status: "READY", pageCount: parsed.numpages ?? 0 },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    await db.document.update({
      where: { id: documentId },
      data: { status: "FAILED", error: message },
    });
    throw err;
  }
}

/** Génère un id compatible cuid côté SQL brut. */
function cuid(): string {
  // Prisma n'expose pas son générateur ici ; on délègue à nanoid-like.
  // Format simple, collision-safe pour notre volume.
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 12)
  );
}

export type { Prisma };
