"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowRight, Dumbbell, Heart, Home, TrendingUp, GraduationCap, Smartphone, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/** Templates : 1 clic = formulaire pré-rempli, pour créer en quelques secondes. */
const TEMPLATES: {
  icon: LucideIcon;
  name: string;
  fullName: string;
  tagline: string;
  prompt: string;
  welcome: string;
}[] = [
  {
    icon: Dumbbell, name: "Coach Muscu",
    fullName: "Coach Muscu IA",
    tagline: "Ton coach de musculation personnel, 24/7",
    prompt: "Tu es un coach de musculation expert et bienveillant. Tu crées des programmes personnalisés, donnes des conseils techniques sur les exercices, et accompagnes sur la nutrition. Tu poses des questions pour adapter tes réponses au niveau et aux objectifs de la personne.",
    welcome: "Bonjour, quel est ton objectif : prise de masse, sèche, ou performance ?",
  },
  {
    icon: Heart, name: "Coach Dating",
    fullName: "Coach Séduction IA",
    tagline: "Booste ta confiance et tes rencontres",
    prompt: "Tu es un coach en séduction et confiance en soi, moderne et respectueux. Tu aides à améliorer les conversations, le profil sur les apps de rencontre, et l'estime de soi. Tu donnes des conseils concrets et bienveillants, jamais manipulateurs.",
    welcome: "Bonjour, sur quoi veux-tu progresser : l'approche, les conversations, ton profil ?",
  },
  {
    icon: Home, name: "Expert Immo",
    fullName: "Expert Immobilier IA",
    tagline: "Tes décisions immobilières, éclairées",
    prompt: "Tu es un expert en immobilier. Tu conseilles sur l'achat, la vente, l'investissement locatif, le financement et la fiscalité. Tu donnes des analyses claires et chiffrées, et tu rappelles tes limites (pas un conseil juridique formel).",
    welcome: "Bonjour, quel est ton projet : acheter, vendre, ou investir ?",
  },
  {
    icon: TrendingUp, name: "Conseiller Business",
    fullName: "Conseiller Business IA",
    tagline: "De l'idée au chiffre d'affaires",
    prompt: "Tu es un conseiller business pour entrepreneurs et indépendants. Tu aides sur la stratégie, le marketing, la vente, les prix et la productivité. Tu es direct, orienté action, et tu proposes des étapes concrètes.",
    welcome: "Bonjour, parle-moi de ton projet ou de ton blocage actuel.",
  },
  {
    icon: GraduationCap, name: "Professeur",
    fullName: "Professeur Particulier IA",
    tagline: "Comprendre n'importe quel sujet, simplement",
    prompt: "Tu es un professeur particulier patient et pédagogue. Tu expliques les concepts simplement, avec des exemples, et tu vérifies la compréhension par des questions. Tu adaptes ton niveau à l'élève.",
    welcome: "Bonjour, quel sujet veux-tu travailler aujourd'hui ?",
  },
  {
    icon: Smartphone, name: "Coach TikTok",
    fullName: "Coach TikTok IA",
    tagline: "Crée du contenu qui capte l'attention",
    prompt: "Tu es un expert en création de contenu court (TikTok, Reels, Shorts). Tu aides sur les idées de vidéos, les hooks, le montage, les tendances et la croissance. Tu donnes des conseils actionnables immédiatement.",
    welcome: "Bonjour, quelle est ta niche ? On va structurer ta stratégie de contenu.",
  },
];

const PRICE_PRESETS = [9, 19, 29, 49];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pricingModel, setPricingModel] = useState<"FREE" | "SUBSCRIPTION" | "ONE_TIME">("SUBSCRIPTION");
  const [price, setPrice] = useState(19);

  // Champs contrôlés (pour le pré-remplissage par template)
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [prompt, setPrompt] = useState("");
  const [welcome, setWelcome] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setName(t.fullName);
    setTagline(t.tagline);
    setPrompt(t.prompt);
    setWelcome(t.welcome);
    toast.success(`Modèle « ${t.name} » appliqué — personnalise-le !`);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 2 || prompt.trim().length < 20) {
      toast.error("Donne un nom et des instructions (20 caractères min).");
      return;
    }
    setLoading(true);
    const payload = {
      name,
      tagline,
      systemPrompt: prompt,
      model,
      welcomeMsg: welcome,
      pricingModel,
      priceMonthly: pricingModel === "SUBSCRIPTION" ? Math.round(price * 100) : 0,
      priceOneTime: pricingModel === "ONE_TIME" ? Math.round(price * 100) : 0,
    };

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error("Création impossible. Vérifie les champs.");
    toast.success("IA créée ! Ajoute tes documents pour la rendre experte.");
    router.push(`/studio/agents/${data.agent.id}/documents`);
  }

  return (
    <div className="container max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Créer ton IA</h1>
          <p className="text-sm text-muted-foreground">Prête en 1 minute. Personnalisable à l'infini.</p>
        </div>
      </div>

      {/* Templates rapides */}
      <div className="mb-8">
        <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pars d'un modèle (optionnel)
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm font-medium transition active:scale-95 hover:border-primary/40 hover:bg-primary/5"
            >
              <t.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-7">
        {/* Identité */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-card/40 p-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'IA *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Coach Muscu IA" required className="h-12 text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Accroche courte</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ton coach perso, disponible 24/7" className="h-12 text-base" />
          </div>
        </div>

        {/* Cerveau */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-card/40 p-5">
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Comment doit-elle se comporter ? *</Label>
            <Textarea
              id="systemPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              required
              placeholder="Tu es un coach expert… Décris son rôle, son ton, ses spécialités."
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">Astuce : tu ajouteras tes PDF à l'étape suivante pour qu'elle réponde avec ton vrai savoir.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMsg">Message d'accueil</Label>
            <Input id="welcomeMsg" value={welcome} onChange={(e) => setWelcome(e.target.value)} placeholder="Salut ! Quel est ton objectif ?" className="h-12 text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Moteur IA</Label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
            >
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6 — qualité maximale</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 — rapide & économique</option>
            </select>
          </div>
        </div>

        {/* Monétisation */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-card/40 p-5">
          <Label className="block">Comment veux-tu gagner ?</Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "FREE", label: "Gratuit" },
              { v: "SUBSCRIPTION", label: "Abonnement" },
              { v: "ONE_TIME", label: "Achat unique" },
            ] as const).map((m) => (
              <button
                key={m.v}
                type="button"
                onClick={() => setPricingModel(m.v)}
                className={`rounded-xl border py-3 text-sm font-medium transition active:scale-95 ${
                  pricingModel === m.v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {pricingModel !== "FREE" && (
            <div className="space-y-3">
              <Label>Prix {pricingModel === "SUBSCRIPTION" ? "mensuel" : "d'accès à vie"} (€)</Label>
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrice(p)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                      price === p ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {p}€
                  </button>
                ))}
                <Input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="h-11 w-24"
                  aria-label="Prix personnalisé"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tu touches <span className="font-semibold text-emerald-400">{(price * 0.8).toFixed(2)}€</span> par vente (80%).
              </p>
            </div>
          )}
        </div>

        {/* CTA sticky sur mobile */}
        <div className="sticky bottom-4 z-10">
          <Button type="submit" size="lg" className="group h-13 w-full text-base glow-primary" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Créer et ajouter mes documents
            {!loading && <ArrowRight className="transition-transform group-hover:translate-x-1" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
