import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canAccessAgent } from "@/lib/access";

export const runtime = "nodejs";

const schema = z.object({
  agentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

/** POST /api/reviews — déposer/mettre à jour un avis (réservé aux utilisateurs ayant accès). */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid_body" }, { status: 400 });
  const { agentId, rating, comment } = parsed.data;

  // Seuls ceux qui ont accès (abonnés/acheteurs/gratuit) peuvent noter.
  const access = await canAccessAgent(session.user.id, agentId);
  if (!access.allowed) return Response.json({ error: "not_allowed" }, { status: 403 });

  await db.$transaction(async (tx) => {
    await tx.review.upsert({
      where: { userId_agentId: { userId: session.user.id, agentId } },
      create: { userId: session.user.id, agentId, rating, comment },
      update: { rating, comment },
    });

    // Recalcule la note moyenne dénormalisée.
    const agg = await tx.review.aggregate({
      where: { agentId },
      _avg: { rating: true },
      _count: true,
    });
    await tx.agent.update({
      where: { id: agentId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });
  });

  return Response.json({ ok: true });
}
