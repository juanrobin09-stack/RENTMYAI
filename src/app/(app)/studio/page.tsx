import Link from "next/link";
import { Plus, Wallet, Bot, TrendingUp, CreditCard, FileText, MessageSquare, Star, ArrowUpRight, Sparkles } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
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
    db.earning.aggregate({ where: { creatorId: user.id }, _sum: { netAmount: true } }),
    db.user.findUnique({ where: { id: user.id }, select: { payoutsEnabled: true } }),
  ]);

  const totalNet = earningsAgg._sum.netAmount ?? 0;
  const activeSubs = agents.reduce((s, a) => s + a.subscriberCount, 0);

  const KPIS = [
    { icon: Wallet, label: "Revenus nets", value: formatPrice(totalNet), accent: true },
    { icon: TrendingUp, label: "Abonnés actifs", value: String(activeSubs) },
    { icon: Bot, label: "IA créées", value: String(agents.length) },
  ];

  return (
    <div className="container py-10 md:py-12">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/70">Studio créateur</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Bonjour {user.name?.split(" ")[0] ?? ""}
          </h1>
          <p className="mt-1 text-muted-foreground">Gère tes IA et suis tes revenus.</p>
        </div>
        <Button size="lg" className="glow-primary" asChild>
          <Link href="/studio/agents/new"><Plus className="h-4 w-4" /> Nouvelle IA</Link>
        </Button>
      </div>

      {/* Bandeau Stripe — informatif, non bloquant */}
      {!me?.payoutsEnabled && (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Tu peux publier des IA gratuites dès maintenant</p>
              <p className="text-sm text-muted-foreground">
                Active Stripe uniquement quand tu veux vendre des IA payantes et recevoir tes revenus.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 border-white/15 bg-white/5" asChild>
            <Link href="/studio/connect">Activer plus tard</Link>
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className={`rounded-2xl border p-6 ${k.accent ? "border-primary/30 bg-gradient-to-br from-primary/10 to-transparent" : "border-white/10 bg-card/40"}`}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <k.icon className="h-4 w-4" /> {k.label}
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Liste des IA */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mes IA</h2>
        {agents.length > 0 && <span className="text-sm text-muted-foreground">{agents.length} au total</span>}
      </div>

      {agents.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-3xl border border-dashed border-white/15 bg-card/30 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Crée ta première IA</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Choisis un modèle, ajoute ta méthode, et publie-la en quelques minutes — gratuitement.
          </p>
          <Button size="lg" className="mt-6 glow-primary" asChild>
            <Link href="/studio/agents/new"><Plus className="h-4 w-4" /> Créer une IA</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {agents.map((a) => (
            <div key={a.id} className="group rounded-2xl border border-white/10 bg-card/40 p-5 transition hover:border-primary/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-primary ring-1 ring-primary/15">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"} className="mt-0.5">
                      {a.status === "PUBLISHED" ? "Publiée" : a.status === "DRAFT" ? "Brouillon" : a.status}
                    </Badge>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {a.pricingModel === "FREE" ? "Gratuit" : a.pricingModel === "SUBSCRIPTION" ? `${formatPrice(a.priceMonthly)}/mois` : "Achat"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {a._count.documents} sources</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {a.subscriberCount} abonnés</span>
                <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {a.usageCount} conv.</span>
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> {a.ratingAvg.toFixed(1)}</span>
              </div>

              <div className="mt-5 flex gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/studio/agents/${a.id}/documents`}>Sources & publication</Link>
                </Button>
                <Button size="sm" variant="outline" className="border-white/15 bg-white/5" asChild>
                  <Link href={`/studio/agents/${a.id}/edit`}>Éditer</Link>
                </Button>
                {a.status === "PUBLISHED" && (
                  <Button size="sm" variant="outline" className="border-white/15 bg-white/5" asChild>
                    <Link href={`/agents/${a.slug}`} aria-label="Voir la fiche publique"><ArrowUpRight className="h-4 w-4" /></Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
