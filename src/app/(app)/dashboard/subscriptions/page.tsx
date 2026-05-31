import Link from "next/link";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Actif", TRIALING: "Essai", PAST_DUE: "Paiement en retard",
  CANCELED: "Annulé", UNPAID: "Impayé", INCOMPLETE: "Incomplet",
};

export default async function SubscriptionsPage() {
  const user = await requireUser();
  const subs = await db.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { id: true, name: true, slug: true, priceMonthly: true } } },
  });

  return (
    <div className="container max-w-2xl py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes abonnements</h1>
        <ManageBillingButton />
      </div>

      <div className="mt-8 space-y-3">
        {subs.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Aucun abonnement.{" "}
            <Link href="/explore" className="font-medium text-foreground hover:underline">Explorer</Link>
          </Card>
        )}
        {subs.map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.agent.name}</span>
                <Badge variant={["ACTIVE", "TRIALING"].includes(s.status) ? "success" : "secondary"}>
                  {STATUS_LABEL[s.status] ?? s.status}
                </Badge>
                {s.cancelAtPeriodEnd && <Badge variant="warning">Se termine bientôt</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPrice(s.agent.priceMonthly)}/mois
                {s.currentPeriodEnd && ` · renouvellement le ${new Intl.DateTimeFormat("fr-FR").format(s.currentPeriodEnd)}`}
              </p>
            </div>
            {["ACTIVE", "TRIALING"].includes(s.status) && (
              <Button size="sm" asChild>
                <Link href={`/chat/${s.agent.id}`}>Chatter</Link>
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
