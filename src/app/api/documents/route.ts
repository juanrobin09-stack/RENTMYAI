import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ingestDocument } from "@/lib/rag/ingest";

export const runtime = "nodejs";
export const maxDuration = 300;

/** GET /api/documents?agentId=... — liste des documents d'un agent (créateur). */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) return Response.json({ error: "agentId_required" }, { status: 400 });

  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: { creatorId: true },
  });
  if (!agent || agent.creatorId !== session.user.id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const documents = await db.document.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      size: true,
      pageCount: true,
      error: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  });

  return Response.json({ documents });
}

const actionSchema = z.object({
  documentId: z.string(),
  action: z.enum(["reingest", "delete"]),
});

/** POST /api/documents — ré-ingestion ou suppression d'un document. */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = actionSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid_body" }, { status: 400 });

  const { documentId, action } = parsed.data;
  const doc = await db.document.findUnique({
    where: { id: documentId },
    select: { id: true, agent: { select: { creatorId: true } } },
  });
  if (!doc || doc.agent.creatorId !== session.user.id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  if (action === "delete") {
    await db.document.delete({ where: { id: documentId } });
    return Response.json({ ok: true });
  }

  // reingest (async)
  ingestDocument(documentId).catch((e) =>
    console.error("[documents] reingest échoué:", e),
  );
  return Response.json({ ok: true, status: "PROCESSING" });
}
