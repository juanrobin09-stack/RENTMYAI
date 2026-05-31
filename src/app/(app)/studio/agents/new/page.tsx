"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini (rapide, économique)" },
  { value: "gpt-4o", label: "GPT-4o (qualité maximale)" },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pricingModel, setPricingModel] = useState<"FREE" | "SUBSCRIPTION" | "ONE_TIME">("SUBSCRIPTION");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name")),
      tagline: String(f.get("tagline") || ""),
      description: String(f.get("description") || ""),
      systemPrompt: String(f.get("systemPrompt")),
      model: String(f.get("model")),
      welcomeMsg: String(f.get("welcomeMsg") || ""),
      pricingModel,
      priceMonthly: pricingModel === "SUBSCRIPTION" ? Math.round(Number(f.get("priceMonthly") || 0) * 100) : 0,
      priceOneTime: pricingModel === "ONE_TIME" ? Math.round(Number(f.get("priceOneTime") || 0) * 100) : 0,
    };

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error("Création impossible. Vérifie les champs.");
    toast.success("IA créée ! Ajoute maintenant tes sources.");
    router.push(`/studio/agents/${data.agent.id}/documents`);
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Créer une IA</h1>
      <p className="mt-2 text-muted-foreground">Configure ton IA experte en quelques étapes.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Card>
          <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'IA *</Label>
              <Input id="name" name="name" placeholder="Coach Muscu IA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Accroche</Label>
              <Input id="tagline" name="tagline" placeholder="Ton coach de musculation personnel, 24/7" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Décris ce que ton IA sait faire…" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cerveau</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Instructions (system prompt) *</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                rows={6}
                required
                placeholder="Tu es un coach de musculation expert. Tu donnes des programmes personnalisés, des conseils nutrition…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMsg">Message d'accueil</Label>
              <Input id="welcomeMsg" name="welcomeMsg" placeholder="Salut ! Quel est ton objectif ?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <select id="model" name="model" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monétisation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["FREE", "SUBSCRIPTION", "ONE_TIME"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPricingModel(m)}
                  className={`rounded-xl border p-3 text-sm transition ${pricingModel === m ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                >
                  {m === "FREE" ? "Gratuit" : m === "SUBSCRIPTION" ? "Abonnement" : "Achat unique"}
                </button>
              ))}
            </div>
            {pricingModel === "SUBSCRIPTION" && (
              <div className="space-y-2">
                <Label htmlFor="priceMonthly">Prix mensuel (€)</Label>
                <Input id="priceMonthly" name="priceMonthly" type="number" min="1" step="0.5" defaultValue="19" />
              </div>
            )}
            {pricingModel === "ONE_TIME" && (
              <div className="space-y-2">
                <Label htmlFor="priceOneTime">Prix d'accès à vie (€)</Label>
                <Input id="priceOneTime" name="priceOneTime" type="number" min="1" step="1" defaultValue="49" />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer et ajouter des sources
        </Button>
      </form>
    </div>
  );
}
