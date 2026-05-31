import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAgentSchema } from "@/lib/validations/agent";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

/** GET /api/agents — agents du créateur connecté. */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const agents = await db.agent.findMany({
    where: { creatorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      pricingModel: true,
      priceMonthly: true,
      ratingAvg: true,
      ratingCount: true,
      subscriberCount: true,
      usageCount: true,
      _count: { select: { documents: true } },
    },
  });

  return Response.json({ agents });
}

/** POST /api/agents — créer un agent (brouillon). */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = createAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // slug unique
  const base = slugify(parsed.data.name) || "agent";
  const slug = `${base}-${nanoid(6).toLowerCase()}`;

  // Promeut l'utilisateur en CREATOR à la première création.
  const agent = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id, role: "USER" },
      data: { role: "CREATOR" },
    }).catch(() => {
      /* déjà CREATOR/ADMIN — ignore */
    });

    return tx.agent.create({
      data: {
        ...parsed.data,
        slug,
        creatorId: session.user.id,
        status: "DRAFT",
      },
      select: { id: true, slug: true, status: true },
    });
  });

  return Response.json({ agent }, { status: 201 });
}
