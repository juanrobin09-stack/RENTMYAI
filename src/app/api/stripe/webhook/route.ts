import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, computeSplit } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Webhook Stripe (plateforme + Connect).
 * Événements gérés :
 *  - checkout.session.completed     → crée Subscription/Purchase + Earning + Referral
 *  - invoice.paid                   → Earning récurrent (abonnements)
 *  - customer.subscription.updated  → maj statut/période
 *  - customer.subscription.deleted  → annulation
 *  - account.updated                → payoutsEnabled du créateur
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, secret);
  } catch (err) {
    console.error("[stripe] signature invalide:", err);
    return new Response("invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object);
        break;
      case "invoice.paid":
        await onInvoicePaid(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await onSubscriptionChange(event.data.object);
        break;
      case "account.updated":
        await onAccountUpdated(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe] échec traitement ${event.type}:`, err);
    return new Response("handler error", { status: 500 });
  }

  return Response.json({ received: true });
}

async function onCheckoutCompleted(s: Stripe.Checkout.Session) {
  const meta = s.metadata ?? {};
  const { agentId, buyerId, creatorId, affiliateCode } = meta as Record<string, string>;
  if (!agentId || !buyerId || !creatorId) return;

  // Lier le customer Stripe à l'utilisateur (pour le portail).
  if (s.customer && typeof s.customer === "string") {
    await db.user.update({
      where: { id: buyerId },
      data: { stripeCustomerId: s.customer },
    }).catch(() => {});
  }

  if (s.mode === "subscription" && s.subscription) {
    await db.subscription.upsert({
      where: { userId_agentId: { userId: buyerId, agentId } },
      create: {
        userId: buyerId,
        agentId,
        stripeSubscriptionId: String(s.subscription),
        status: "ACTIVE",
      },
      update: { stripeSubscriptionId: String(s.subscription), status: "ACTIVE" },
    });
    await db.agent.update({
      where: { id: agentId },
      data: { subscriberCount: { increment: 1 } },
    });
    // L'Earning de l'abonnement est créé via invoice.paid (premier paiement).
  }

  if (s.mode === "payment") {
    const amount = s.amount_total ?? 0;
    await db.purchase.upsert({
      where: { userId_agentId: { userId: buyerId, agentId } },
      create: {
        userId: buyerId,
        agentId,
        amount,
        stripePaymentIntentId:
          typeof s.payment_intent === "string" ? s.payment_intent : null,
      },
      update: {},
    });
    await recordEarning({
      creatorId,
      agentId,
      gross: amount,
      source: "one_time",
      affiliateCode,
      chargeId: typeof s.payment_intent === "string" ? s.payment_intent : null,
    });
  }
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const sub = await db.subscription.findUnique({
    where: { stripeSubscriptionId: String(invoice.subscription) },
    select: { agentId: true, agent: { select: { creatorId: true } } },
  });
  if (!sub) return;

  await recordEarning({
    creatorId: sub.agent.creatorId,
    agentId: sub.agentId,
    gross: invoice.amount_paid,
    source: "subscription",
    affiliateCode: (invoice.subscription_details?.metadata?.affiliateCode as string) ?? "",
    chargeId: typeof invoice.charge === "string" ? invoice.charge : null,
  });
}

async function onSubscriptionChange(sub: Stripe.Subscription) {
  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true, agentId: true, status: true },
  });
  if (!existing) return;

  const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIALING" | "INCOMPLETE"> = {
    active: "ACTIVE",
    trialing: "TRIALING",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELED",
  };
  const newStatus = statusMap[sub.status] ?? "ACTIVE";

  await db.subscription.update({
    where: { id: existing.id },
    data: {
      status: newStatus,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
    },
  });

  // Décrémente les abonnés si l'abonnement devient inactif.
  if (existing.status === "ACTIVE" && ["CANCELED", "UNPAID"].includes(newStatus)) {
    await db.agent.update({
      where: { id: existing.agentId },
      data: { subscriberCount: { decrement: 1 } },
    });
  }
}

async function onAccountUpdated(account: Stripe.Account) {
  const enabled = Boolean(account.payouts_enabled && account.charges_enabled);
  await db.user.updateMany({
    where: { stripeConnectId: account.id },
    data: { stripeConnectEnabled: account.details_submitted ?? false, payoutsEnabled: enabled },
  });
}

/** Crée un Earning + (si applicable) une commission d'affiliation. */
async function recordEarning(params: {
  creatorId: string;
  agentId: string;
  gross: number;
  source: "subscription" | "one_time";
  affiliateCode?: string;
  chargeId: string | null;
}) {
  let referrer: { id: string } | null = null;
  if (params.affiliateCode) {
    referrer = await db.user.findUnique({
      where: { affiliateCode: params.affiliateCode },
      select: { id: true },
    });
    if (referrer?.id === params.creatorId) referrer = null; // pas d'auto-affiliation
  }

  const { platformFee, affiliateFee, netAmount } = computeSplit(
    params.gross,
    Boolean(referrer),
  );

  await db.$transaction(async (tx) => {
    await tx.earning.create({
      data: {
        creatorId: params.creatorId,
        agentId: params.agentId,
        grossAmount: params.gross,
        platformFee,
        affiliateFee,
        netAmount,
        source: params.source,
        stripeChargeId: params.chargeId,
      },
    });

    if (referrer) {
      await tx.referral.create({
        data: {
          referrerId: referrer.id,
          status: "CONVERTED",
          commission: affiliateFee,
        },
      });
    }
  });
}
