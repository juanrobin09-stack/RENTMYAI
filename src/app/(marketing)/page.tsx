import Link from "next/link";
import { ArrowRight, Sparkles, Upload, MessageSquare, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { AgentCard } from "@/components/marketplace/agent-card";

export const revalidate = 60; // ISR

const STEPS = [
  { icon: Sparkles, title: "Crée ton IA", desc: "Donne-lui un nom, un rôle et ta méthode. Zéro code." },
  { icon: Upload, title: "Upload tes PDF", desc: "Tes cours, fiches, docs : l'IA répond avec ton vrai savoir (RAG)." },
  { icon: MessageSquare, title: "Publie-la", desc: "Sur la marketplace, indexée et trouvable par tes clients." },
  { icon: Wallet, title: "Sois payé", desc: "Abonnement ou achat. Stripe te verse automatiquement." },
];

export default async function HomePage() {
  const featured = await db.agent.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { usageCount: "desc" }],
    take: 6,
    select: {
      slug: true, name: true, tagline: true, avatar: true,
      pricingModel: true, priceMonthly: true, priceOneTime: true,
      ratingAvg: true, ratingCount: true, usageCount: true,
      category: { select: { name: true } },
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container flex flex-col items-center py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Transforme ton expertise en IA monétisable
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Crée une IA à partir de tes connaissances, et{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              loue-la
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Coach, expert, formateur : déploie ton IA spécialisée en quelques
            minutes et génère des revenus récurrents.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/studio">
                Créer mon IA <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/explore">Explorer la marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Étape {i + 1}</div>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">IA populaires</h2>
              <p className="text-muted-foreground">Les expertises les plus consultées</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/explore">Tout voir <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => (
              <AgentCard key={a.slug} agent={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
