import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getOrCreateConnectAccount,
  createConnectOnboardingLink,
} from "@/lib/stripe";

export const runtime = "nodejs";

/** POST /api/stripe/connect — démarre/reprend l'onboarding Stripe Connect. */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, stripeConnectId: true },
  });
  if (!user) return Response.json({ error: "not_found" }, { status: 404 });

  const accountId = await getOrCreateConnectAccount({
    existingId: user.stripeConnectId,
    email: user.email,
  });

  if (accountId !== user.stripeConnectId) {
    await db.user.update({
      where: { id: user.id },
      data: { stripeConnectId: accountId },
    });
  }

  const url = await createConnectOnboardingLink(accountId);
  return Response.json({ url });
}
