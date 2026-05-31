import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { updateAgentSchema } from "@/lib/validations/agent";

export const runtime = "nodejs";

async function assertOwner(req: NextRequest, agentId: string) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return { error: "unauthorized" as const, status: 401 };
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: { id: true, creatorId: true },
  });
  if (!agent) return { error: "not_found" as const, status: 404 };
  if (agent.creatorId !== session.user.id)
    return { error: "forbidden" as const, status: 403 };
  return { userId: session.user.id };
}

const patchSchema = updateAgentSchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

/** PATCH /api/agents/[id] — met à jour / publie un agent. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await assertOwner(req, id);
  if ("error" in guard) return Response.json({ error: guard.error }, { status: guard.status });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "invalid_body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Publication : vérifie les prérequis et provisionne Stripe si payant.
  if (data.status === "PUBLISHED") {
    const agent = await db.agent.findUnique({
      where: { id },
      include: { creator: { select: { payoutsEnabled: true } }, _count: { select: { documents: true } } },
    });
    if (!agent) return Response.json({ error: "not_found" }, { status: 404 });

    if (agent.pricingModel !== "FREE" && !agent.creator.payoutsEnabled) {
      return Response.json({ error: "connect_required" }, { status: 409 });
    }

    let stripeProductId = agent.stripeProductId;
    if (agent.pricingModel !== "FREE" && !stripeProductId) {
      const product = await stripe.products.create({ name: agent.name });
      stripeProductId = product.id;
    }

    await db.agent.update({
      where: { id },
      data: {
        ...stripData(data),
        status: "PUBLISHED",
        publishedAt: agent.publishedAt ?? new Date(),
        stripeProductId,
      },
    });
    return Response.json({ ok: true, status: "PUBLISHED" });
  }

  await db.agent.update({ where: { id }, data: stripData(data) });
  return Response.json({ ok: true });
}

/** DELETE /api/agents/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await assertOwner(req, id);
  if ("error" in guard) return Response.json({ error: guard.error }, { status: guard.status });

  await db.agent.delete({ where: { id } });
  return Response.json({ ok: true });
}

/** Retire `status` (géré à part) du payload de mise à jour. */
function stripData<T extends { status?: unknown }>(data: T) {
  const { status: _status, ...rest } = data;
  return rest;
}
