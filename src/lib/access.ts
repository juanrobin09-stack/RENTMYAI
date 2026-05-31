import { db } from "@/lib/db";

/**
 * Vérifie qu'un utilisateur a le droit de discuter avec un agent.
 * Règles d'accès :
 *  - le créateur a toujours accès à son propre agent (test/preview) ;
 *  - agent FREE → accès à tout utilisateur connecté ;
 *  - SUBSCRIPTION → abonnement actif requis ;
 *  - ONE_TIME → achat requis.
 */
export async function canAccessAgent(
  userId: string,
  agentId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: { id: true, creatorId: true, pricingModel: true, status: true },
  });

  if (!agent) return { allowed: false, reason: "not_found" };
  if (agent.creatorId === userId) return { allowed: true };
  if (agent.status !== "PUBLISHED")
    return { allowed: false, reason: "unavailable" };

  if (agent.pricingModel === "FREE") return { allowed: true };

  if (agent.pricingModel === "SUBSCRIPTION") {
    const sub = await db.subscription.findUnique({
      where: { userId_agentId: { userId, agentId } },
      select: { status: true },
    });
    const active = sub && ["ACTIVE", "TRIALING"].includes(sub.status);
    return active
      ? { allowed: true }
      : { allowed: false, reason: "subscription_required" };
  }

  if (agent.pricingModel === "ONE_TIME") {
    const purchase = await db.purchase.findUnique({
      where: { userId_agentId: { userId, agentId } },
      select: { id: true },
    });
    return purchase
      ? { allowed: true }
      : { allowed: false, reason: "purchase_required" };
  }

  return { allowed: false, reason: "forbidden" };
}
