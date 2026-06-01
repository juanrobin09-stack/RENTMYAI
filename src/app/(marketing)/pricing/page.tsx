import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "RentMyAI est gratuit pour créer. Nous prenons une commission uniquement quand tu gagnes.",
};

const PLANS = [
  {
    name: "Créateur",
    price: "Gratuit",
    desc: "Crée et publie tes IA. Paie seulement quand tu gagnes.",
    features: ["IA illimitées", "Upload PDF & RAG", "Paiements Stripe Connect", "Commission 20% sur les ventes", "Analytics de base"],
    cta: "Créer mon IA",
    href: "/studio",
    highlight: true,
  },
  {
    name: "Utilisateur",
    price: "Selon l'IA",
    desc: "Loue les IA dont tu as besoin, à l'abonnement ou à l'achat.",
    features: ["Accès aux IA premium", "RAG sur le savoir de l'expert", "Historique de conversations", "Annulation à tout moment"],
    cta: "Explorer",
    href: "/explore",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="glow container relative py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium">
            💸 Aligné sur ta réussite
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Tarifs <span className="font-serif italic text-gradient">transparents</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Gratuit pour créer. On gagne uniquement quand tu gagnes.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? "gradient-border relative p-8 shadow-2xl shadow-primary/10"
                  : "rounded-2xl border border-border bg-card p-8"
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-primary/30">
                  Le plus populaire
                </span>
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary/80">{p.name}</h2>
              <div className="mt-3 text-4xl font-bold tracking-tight">{p.price}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-7 space-y-3.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${p.highlight ? "shadow-lg shadow-primary/25" : ""}`}
                variant={p.highlight ? "default" : "outline"}
                asChild
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-md text-center text-sm text-muted-foreground">
          Commission de 20% sur les ventes. Le reste te revient, viré
          automatiquement par Stripe.
        </p>
      </div>
    </div>
  );
}
