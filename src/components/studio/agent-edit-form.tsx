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

interface Props {
  agent: {
    id: string;
    name: string;
    tagline: string | null;
    description: string | null;
    systemPrompt: string;
    welcomeMsg: string | null;
    model: string;
    priceMonthly: number;
    pricingModel: "FREE" | "SUBSCRIPTION" | "ONE_TIME";
  };
}

const MODELS = [
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — qualité maximale" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — rapide & économique" },
];

export function AgentEditForm({ agent }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(f.get("name")),
        tagline: String(f.get("tagline") || ""),
        description: String(f.get("description") || ""),
        systemPrompt: String(f.get("systemPrompt")),
        welcomeMsg: String(f.get("welcomeMsg") || ""),
        model: String(f.get("model")),
        ...(agent.pricingModel === "SUBSCRIPTION"
          ? { priceMonthly: Math.round(Number(f.get("priceMonthly") || 0) * 100) }
          : {}),
      }),
    });
    setLoading(false);
    if (!res.ok) return toast.error("Enregistrement impossible");
    toast.success("Modifications enregistrées");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" defaultValue={agent.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Accroche</Label>
            <Input id="tagline" name="tagline" defaultValue={agent.tagline ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={agent.description ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cerveau</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Instructions</Label>
            <Textarea id="systemPrompt" name="systemPrompt" rows={6} defaultValue={agent.systemPrompt} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMsg">Message d'accueil</Label>
            <Input id="welcomeMsg" name="welcomeMsg" defaultValue={agent.welcomeMsg ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Moteur IA</Label>
            <select
              id="model"
              name="model"
              defaultValue={MODELS.some((m) => m.value === agent.model) ? agent.model : "claude-sonnet-4-6"}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          {agent.pricingModel === "SUBSCRIPTION" && (
            <div className="space-y-2">
              <Label htmlFor="priceMonthly">Prix mensuel (€)</Label>
              <Input id="priceMonthly" name="priceMonthly" type="number" min="1" step="0.5" defaultValue={agent.priceMonthly / 100} />
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
