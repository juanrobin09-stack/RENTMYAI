import Link from "next/link";
import { ArrowRight, Sparkles, Upload, MessageSquare, Wallet, Star, Zap, Shield, Check, Heart, Dumbbell, Home, TrendingUp, GraduationCap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { AgentCard } from "@/components/marketplace/agent-card";

export const revalidate = 60; // ISR

const STEPS = [
  { icon: Sparkles, title: "Crée ton IA", desc: "Un nom, un rôle, ta méthode. Zéro ligne de code." },
  { icon: Upload, title: "Nourris-la", desc: "Tes PDF, cours et fiches. Elle répond avec ton vrai savoir." },
  { icon: MessageSquare, title: "Publie-la", desc: "Sur une marketplace indexée, trouvable par tes clients." },
  { icon: Wallet, title: "Encaisse", desc: "Abonnement ou achat. Stripe te verse automatiquement." },
];

const CATEGORIES = [
  { icon: Heart, name: "Coach Dating" },
  { icon: Dumbbell, name: "Coach Muscu" },
  { icon: Home, name: "Expert Immo" },
  { icon: TrendingUp, name: "Business" },
  { icon: GraduationCap, name: "Professeur" },
  { icon: Smartphone, name: "Coach TikTok" },
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
      <section className="relative">
        <div className="container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Texte */}
          <div className="text-center lg:text-left">
            <div className="mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" style={{ animation: "pulse-dot 2s infinite" }} />
              La marketplace des IA expertes
            </div>

            <h1 className="animate-fade-up text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl xl:text-7xl" style={{ animationDelay: "60ms" }}>
              Ton savoir,
              <br />
              transformé en{" "}
              <span className="font-serif italic text-gradient">revenu</span>
            </h1>

            <p className="mx-auto mt-7 max-w-md animate-fade-up text-lg leading-relaxed text-muted-foreground lg:mx-0" style={{ animationDelay: "120ms" }}>
              Crée une IA spécialisée à partir de ton expertise et loue-la.
              Sans code. Tu gardes <span className="text-foreground">80%</span> de chaque vente.
            </p>

            <div className="mt-9 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "180ms" }}>
              <Button size="lg" className="group h-12 px-7 text-base glow-primary" asChild>
                <Link href="/studio">
                  Créer mon IA — gratuit
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/12 bg-white/5 px-7 text-base backdrop-blur hover:bg-white/10" asChild>
                <Link href="/explore">Explorer</Link>
              </Button>
            </div>

            <div className="mt-9 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start" style={{ animationDelay: "240ms" }}>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Sans code</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Stripe sécurisé</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> 80% reversés</span>
            </div>
          </div>

          {/* Mockup produit */}
          <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <ChatMockup />
          </div>
        </div>

        {/* Catégories défilantes */}
        <div className="container pb-8">
          <div className="flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((c, i) => (
              <div
                key={c.name}
                className="glass animate-float flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <c.icon className="h-4 w-4 text-primary" />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STEPS ───────── */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/70">Comment ça marche</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            De l'idée au revenu, <span className="font-serif italic text-gradient">sans effort</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="group relative bg-card/40 p-7 backdrop-blur transition hover:bg-card/80">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-transparent text-primary ring-1 ring-primary/20 transition group-hover:scale-110">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="font-serif text-2xl italic text-primary/40">0{i + 1}</div>
              <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      {featured.length > 0 && (
        <section className="container py-12">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">IA populaires</h2>
              <p className="mt-2 text-muted-foreground">Les expertises les plus consultées</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary" asChild>
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
      <section className="container py-28">
        <div className="ring-gradient relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-card to-background p-12 text-center md:p-20">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Ton expertise vaut de l'or.
              <br />
              <span className="font-serif italic text-gradient">Monétise-la aujourd'hui.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              Gratuit pour créer. Tu ne paies que quand tu gagnes.
            </p>
            <Button size="lg" className="mt-9 h-12 px-8 text-base glow-primary" asChild>
              <Link href="/studio">Lancer mon IA <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/* Aperçu produit : illustration de l'expérience de chat (exemple générique) */
function ChatMockup() {
  return (
    <div className="ring-gradient relative mx-auto max-w-md rounded-3xl bg-card/60 p-2 shadow-2xl backdrop-blur-xl">
      <div className="rounded-[1.3rem] border border-white/5 bg-background/60">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white"><Dumbbell className="h-4 w-4" /></div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Coach Muscu IA</div>
            <div className="text-xs text-muted-foreground">Exemple d'IA</div>
          </div>
          <div className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">Premium</div>
        </div>

        {/* Messages */}
        <div className="space-y-3 p-4">
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
              Programme prise de masse, 4 jours/semaine ?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 px-3.5 py-2.5 text-sm">
              Parfait. Voici un split Upper/Lower :
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>• Lun — Haut du corps (force)</div>
                <div>• Mar — Bas du corps (volume)</div>
                <div>• Jeu — Haut (hypertrophie)</div>
                <div>• Ven — Bas + abdos</div>
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white/5 px-3.5 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" style={{ animation: "pulse-dot 1.2s infinite" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" style={{ animation: "pulse-dot 1.2s 0.2s infinite" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" style={{ animation: "pulse-dot 1.2s 0.4s infinite" }} />
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted-foreground">
            Pose ta question…
            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Badge flottant : explique le modèle, sans chiffre inventé */}
      <div className="absolute -bottom-5 -left-5 glass animate-float flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Wallet className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Tu touches</div>
          <div className="text-sm font-semibold">80% par vente</div>
        </div>
      </div>

      <div className="absolute -right-4 -top-4 glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-xl" style={{ animation: "float 7s 1s ease-in-out infinite" }}>
        <Check className="h-3.5 w-3.5 text-emerald-400" /> Réponses basées sur tes docs
      </div>
    </div>
  );
}
