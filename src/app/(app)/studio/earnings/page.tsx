import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const user = await requireUser();

  const [earnings, agg] = await Promise.all([
    db.earning.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { agent: { select: { name: true } } },
    }),
    db.earning.aggregate({
      where: { creatorId: user.id },
      _sum: { grossAmount: true, platformFee: true, netAmount: true },
    }),
  ]);

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Revenus</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Brut encaissé</div>
          <div className="mt-1 text-2xl font-bold">{formatPrice(agg._sum.grossAmount ?? 0)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Commission RentMyAI</div>
          <div className="mt-1 text-2xl font-bold">{formatPrice(agg._sum.platformFee ?? 0)}</div>
        </Card>
        <Card className="p-5 border-primary/40">
          <div className="text-sm text-muted-foreground">Net pour toi</div>
          <div className="mt-1 text-2xl font-bold text-primary">{formatPrice(agg._sum.netAmount ?? 0)}</div>
        </Card>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Historique</h2>
      <div className="mt-4 space-y-2">
        {earnings.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">Aucune transaction pour l'instant.</Card>
        )}
        {earnings.map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{e.agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(e.createdAt)} ·{" "}
                <Badge variant="secondary">{e.source === "subscription" ? "Abonnement" : "Achat"}</Badge>
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-emerald-600">+{formatPrice(e.netAmount)}</p>
              <p className="text-xs text-muted-foreground">sur {formatPrice(e.grossAmount)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
