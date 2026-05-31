import { Gift, Users, Wallet } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { ensureAffiliateCode, affiliateUrl } from "@/lib/affiliate";
import { Card } from "@/components/ui/card";
import { CopyLink } from "@/components/affiliate/copy-link";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const user = await requireUser();
  const code = await ensureAffiliateCode(user.id);

  const [agg, count] = await Promise.all([
    db.referral.aggregate({
      where: { referrerId: user.id },
      _sum: { commission: true },
    }),
    db.referral.count({ where: { referrerId: user.id, status: { in: ["CONVERTED", "PAID"] } } }),
  ]);

  return (
    <div className="container max-w-2xl py-12">
      <div className="flex items-center gap-3">
        <Gift className="h-7 w-7" />
        <h1 className="text-3xl font-bold">Programme d'affiliation</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Gagne {process.env.AFFILIATE_COMMISSION_PERCENT ?? 15}% de commission sur chaque
        utilisateur que tu amènes, pendant {process.env.AFFILIATE_COOKIE_DAYS ?? 30} jours.
      </p>

      <Card className="mt-8 p-6">
        <label className="text-sm font-medium">Ton lien d'affiliation</label>
        <div className="mt-2">
          <CopyLink url={affiliateUrl(code)} />
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Conversions</div>
          <div className="mt-1 text-2xl font-bold">{count}</div>
        </Card>
        <Card className="p-5 border-primary/40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Commissions</div>
          <div className="mt-1 text-2xl font-bold text-primary">{formatPrice(agg._sum.commission ?? 0)}</div>
        </Card>
      </div>
    </div>
  );
}
