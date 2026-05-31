import Link from "next/link";
import { Plus, Wallet, Bot, TrendingUp, AlertCircle } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await requireUser();

  const [agents, earningsAgg, me] = await Promise.all([
    db.agent.findMany({
      where: { creatorId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, name: true, slug: true, status: true, pricingModel: true,
        priceMonthly: true, subscriberCount: true, usageCount: true,
        ratingAvg: true, _count: { select: { documents: true } },
      },
    }),
    db.earning.aggregate({
      where: { creatorId: user.id },
      _sum: { netAmount: true },
    }),
    db.user.findUnique({ where: { id: user.id }, select: { payoutsEnabled: true } }),
  ]);

  const totalNet = earningsAgg._sum.netAmount ?? 0;
  const activeSubs = agents.reduce((s, a) => s + a.subscriberCount, 0);

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Studio créateur</h1>
          <p className="text-muted-foreground">Gère tes IA et tes revenus</p>
        </div>
        <Button asChild>
          <Link href="/studio/agents/new"><Plus className="h-4 w-4" /> Nouvelle IA</Link>
        </Button>
      </div>

      {!me?.payoutsEnabled && (
        <Card className="mt-6 flex items-center justify-between border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm">Active les paiements pour publier des IA payantes et être rémunéré.</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/studio/connect">Activer Stripe</Link>
          </Button>
        </Card>
      )}

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Revenus nets</div>
          <div className="mt-2 text-3xl font-bold">{formatPrice(totalNet)}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Abonnés actifs</div>
          <div className="mt-2 text-3xl font-bold">{activeSubs}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Bot className="h-4 w-4" /> IA créées</div>
          <div className="mt-2 text-3xl font-bold">{agents.length}</div>
        </Card>
      </div>

      {/* Liste agents */}
      <h2 className="mt-12 text-xl font-semibold">Mes IA</h2>
      <div className="mt-4 space-y-3">
        {agents.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            Aucune IA. <Link href="/studio/agents/new" className="font-medium text-foreground hover:underline">Crée ta première IA</Link>.
          </Card>
        )}
        {agents.map((a) => (
          <Card key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{a.name}</span>
                <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"}>
                  {a.status === "PUBLISHED" ? "Publiée" : a.status === "DRAFT" ? "Brouillon" : a.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {a._count.documents} sources · {a.subscriberCount} abonnés · {a.usageCount} conversations
                {a.pricingModel === "SUBSCRIPTION" && ` · ${formatPrice(a.priceMonthly)}/mois`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/studio/agents/${a.id}/documents`}>Sources</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/studio/agents/${a.id}/edit`}>Éditer</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
