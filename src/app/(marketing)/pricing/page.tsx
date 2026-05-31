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
    <div className="container py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Tarifs simples et transparents</h1>
        <p className="mt-3 text-muted-foreground">
          Gratuit pour créer. On gagne quand tu gagnes.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.name} className={`p-8 ${p.highlight ? "border-primary ring-1 ring-primary" : ""}`}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <div className="mt-2 text-3xl font-bold">{p.price}</div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={p.highlight ? "default" : "outline"} asChild>
              <Link href={p.href}>{p.cta}</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
