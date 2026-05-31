import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const schema = z.object({ agentId: z.string() });

/**
 * POST /api/stripe/checkout — crée une session Checkout pour louer un agent.
 * - SUBSCRIPTION : abonnement mensuel récurrent (destination charge + fee).
 * - ONE_TIME : paiement unique (accès à vie).
 * Le créateur reçoit l'argent via `transfer_data.destination`, RentMyAI
 * prélève `application_fee` / `application_fee_percent`.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid_body" }, { status: 400 });

  const agent = await db.agent.findUnique({
    where: { id: parsed.data.agentId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      pricingModel: true,
      priceMonthly: true,
      priceOneTime: true,
      trialDays: true,
      creator: { select: { id: true, stripeConnectId: true, payoutsEnabled: true } },
    },
  });
  if (!agent || agent.status !== "PUBLISHED") {
    return Response.json({ error: "unavailable" }, { status: 404 });
  }
  if (agent.pricingModel === "FREE") {
    return Response.json({ error: "agent_is_free" }, { status: 400 });
  }
  if (!agent.creator.stripeConnectId || !agent.creator.payoutsEnabled) {
    return Response.json({ error: "creator_payouts_disabled" }, { status: 409 });
  }
  if (agent.creator.id === session.user.id) {
    return Response.json({ error: "cannot_buy_own_agent" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL!;
  const affiliateCode = (await cookies()).get("rma_ref")?.value;

  const common = {
    success_url: `${base}/chat/${agent.id}?welcome=1`,
    cancel_url: `${base}/agents/${agent.slug}`,
    client_reference_id: session.user.id,
    metadata: {
      agentId: agent.id,
      buyerId: session.user.id,
      creatorId: agent.creator.id,
      affiliateCode: affiliateCode ?? "",
    },
  };

  let checkout;
  if (agent.pricingModel === "SUBSCRIPTION") {
    checkout = await stripe.checkout.sessions.create({
      ...common,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: agent.priceMonthly,
            recurring: { interval: "month" },
            product_data: { name: `${agent.name} — abonnement` },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(agent.trialDays > 0 ? { trial_period_days: agent.trialDays } : {}),
        application_fee_percent: PLATFORM_FEE_PERCENT,
        transfer_data: { destination: agent.creator.stripeConnectId },
        metadata: common.metadata,
      },
    });
  } else {
    checkout = await stripe.checkout.sessions.create({
      ...common,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: agent.priceOneTime,
            product_data: { name: `${agent.name} — accès à vie` },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(
          (agent.priceOneTime * PLATFORM_FEE_PERCENT) / 100,
        ),
        transfer_data: { destination: agent.creator.stripeConnectId },
        metadata: common.metadata,
      },
    });
  }

  return Response.json({ url: checkout.url });
}
