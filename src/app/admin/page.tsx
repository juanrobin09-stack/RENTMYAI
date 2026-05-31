import { Users, Bot, Wallet, CreditCard } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [userCount, agentCount, publishedCount, subCount, platformRevenue, recentAgents] =
    await Promise.all([
      db.user.count(),
      db.agent.count(),
      db.agent.count({ where: { status: "PUBLISHED" } }),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.earning.aggregate({ _sum: { platformFee: true } }),
      db.agent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { creator: { select: { email: true } } },
      }),
    ]);

  const kpis = [
    { icon: Users, label: "Utilisateurs", value: userCount },
    { icon: Bot, label: "Agents", value: `${publishedCount}/${agentCount}` },
    { icon: CreditCard, label: "Abonnements actifs", value: subCount },
    { icon: Wallet, label: "Revenu plateforme", value: formatPrice(platformRevenue._sum.platformFee ?? 0) },
  ];

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Vue d'ensemble</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <k.icon className="h-4 w-4" /> {k.label}
            </div>
            <div className="mt-1 text-2xl font-bold">{k.value}</div>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Derniers agents</h2>
      <div className="mt-4 space-y-2">
        {recentAgents.map((a) => (
          <Card key={a.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.creator.email}</p>
            </div>
            <Badge variant={a.status === "PUBLISHED" ? "success" : a.status === "SUSPENDED" ? "warning" : "secondary"}>
              {a.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
