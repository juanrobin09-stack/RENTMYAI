import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { ingestDocument } from "@/lib/rag/ingest";

const f = createUploadthing();

/**
 * File router UploadThing.
 * `agentDocument` : upload de PDF rattaché à un agent dont l'utilisateur
 * est le créateur. À la complétion, on crée le Document et on déclenche
 * l'ingestion RAG (non bloquante pour l'UX).
 */
export const ourFileRouter = {
  agentDocument: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    // agentId passé côté client via input
    .input(z.object({ agentId: z.string() }))
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) throw new UploadThingError("Non authentifié");

      const agent = await db.agent.findUnique({
        where: { id: input.agentId },
        select: { id: true, creatorId: true },
      });
      if (!agent || agent.creatorId !== session.user.id) {
        throw new UploadThingError("Accès refusé à cet agent");
      }
      return { userId: session.user.id, agentId: agent.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const doc = await db.document.create({
        data: {
          agentId: metadata.agentId,
          name: file.name,
          fileUrl: file.ufsUrl ?? file.url,
          fileKey: file.key,
          mimeType: "application/pdf",
          size: file.size,
          status: "PENDING",
        },
      });

      // Déclenche l'ingestion. En prod, préférer une file (QStash/Inngest).
      ingestDocument(doc.id).catch((e) =>
        console.error("[uploadthing] ingestion échouée:", e),
      );

      return { documentId: doc.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
