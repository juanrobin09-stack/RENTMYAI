import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = Number(
  process.env.PLATFORM_FEE_PERCENT ?? 20,
);
export const AFFILIATE_COMMISSION_PERCENT = Number(
  process.env.AFFILIATE_COMMISSION_PERCENT ?? 15,
);

/**
 * Calcule la répartition d'un paiement.
 * - platformFee : commission RentMyAI (sur le montant brut)
 * - affiliateFee : part de la commission plateforme reversée à l'affilié (le
 *   créateur n'est pas impacté par l'affiliation, elle se prélève sur notre part)
 * - netAmount : ce que touche le créateur (brut - platformFee)
 */
export function computeSplit(
  grossAmount: number,
  hasAffiliate: boolean,
): { platformFee: number; affiliateFee: number; netAmount: number } {
  const platformFee = Math.round((grossAmount * PLATFORM_FEE_PERCENT) / 100);
  const affiliateFee = hasAffiliate
    ? Math.round((platformFee * AFFILIATE_COMMISSION_PERCENT) / 100)
    : 0;
  const netAmount = grossAmount - platformFee;
  return { platformFee, affiliateFee, netAmount };
}

/** Crée (ou réutilise) un compte Stripe Connect Express pour un créateur. */
export async function getOrCreateConnectAccount(params: {
  existingId: string | null;
  email: string;
}): Promise<string> {
  if (params.existingId) return params.existingId;
  const account = await stripe.accounts.create({
    type: "express",
    email: params.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: "individual",
  });
  return account.id;
}

/** Lien d'onboarding KYC pour le créateur. */
export async function createConnectOnboardingLink(
  accountId: string,
  returnPath = "/studio/connect",
): Promise<string> {
  const base = process.env.NEXT_PUBLIC_APP_URL!;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${base}${returnPath}?refresh=1`,
    return_url: `${base}${returnPath}?success=1`,
    type: "account_onboarding",
  });
  return link.url;
}
