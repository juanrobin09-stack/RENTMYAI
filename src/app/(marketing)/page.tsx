import Link from "next/link";
import { ArrowRight, Sparkles, Upload, MessageSquare, Wallet, Star, Zap, Shield } from "lucide-react";
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

const CATEGORIES = [
  { emoji: "💘", name: "Coach Dating" },
  { emoji: "💪", name: "Coach Muscu" },
  { emoji: "🏠", name: "Expert Immo" },
  { emoji: "📈", name: "Conseiller Business" },
  { emoji: "🎓", name: "Professeur IA" },
  { emoji: "📱", name: "Coach TikTok" },
];

async function getFeatured() {
  try {
    return await db.agent.findMany({
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
  } catch (err) {
    console.error("[home] chargement des IA populaires échoué:", err);
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="glow container relative flex flex-col items-center py-28 text-center md:py-40">
          <div className="mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-foreground/90 backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary))]" />
            La marketplace des IA expertes
          </div>

          <h1 className="max-w-4xl animate-fade-up text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl" style={{ animationDelay: "60ms" }}>
            <span className="text-gradient-soft">Transforme ton savoir</span>
            <br />
            en IA, et <span className="text-gradient">loue-la.</span>
          </h1>

          <p className="mt-7 max-w-xl animate-fade-up text-balance text-lg text-muted-foreground md:text-xl" style={{ animationDelay: "120ms" }}>
            Coach, expert, formateur — déploie ton IA spécialisée en quelques
            minutes et génère des <span className="text-foreground">revenus récurrents</span>.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
            <Button size="lg" className="group h-12 px-7 text-base shadow-lg shadow-primary/25" asChild>
              <Link href="/studio">
                Créer mon IA gratuitement
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-border/60 px-7 text-base backdrop-blur" asChild>
              <Link href="/explore">Explorer la marketplace</Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground" style={{ animationDelay: "240ms" }}>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Sans code</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Paiements sécurisés Stripe</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> 80% reversés au créateur</span>
          </div>

          {/* Floating category pills */}
          <div className="mt-14 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: "300ms" }}>
            {CATEGORIES.map((c, i) => (
              <div
                key={c.name}
                className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium"
                style={{ animation: `float 6s ease-in-out ${i * 0.4}s infinite` }}
              >
                <span className="text-base">{c.emoji}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STEPS ───────── */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">De l'expertise au revenu en 4 étapes</h2>
          <p className="mt-3 text-muted-foreground">Tout est automatisé. Tu te concentres sur ton savoir.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="gradient-border group p-6 transition hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary/70">Étape {i + 1}</div>
              <h3 className="mt-1.5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      {featured.length > 0 && (
        <section className="container py-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">IA populaires</h2>
              <p className="mt-2 text-muted-foreground">Les expertises les plus consultées</p>
            </div>
            <Button variant="ghost" className="text-primary" asChild>
              <Link href="/explore">Tout voir <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => (
              <AgentCard key={a.slug} agent={a} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── CTA ───────── */}
      <section className="container py-24">
        <div className="glow relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Ton expertise vaut de l'or. <span className="text-gradient">Monétise-la.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              Gratuit pour créer. Tu ne paies que quand tu gagnes.
            </p>
            <Button size="lg" className="mt-8 h-12 px-8 text-base shadow-lg shadow-primary/25" asChild>
              <Link href="/studio">Lancer mon IA <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
