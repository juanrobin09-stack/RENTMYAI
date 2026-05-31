"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RentButtonProps {
  agentId: string;
  pricingModel: "FREE" | "SUBSCRIPTION" | "ONE_TIME";
  label: string;
  isAuthed: boolean;
}

const ERRORS: Record<string, string> = {
  creator_payouts_disabled: "Ce créateur n'a pas encore activé les paiements.",
  cannot_buy_own_agent: "Tu ne peux pas louer ta propre IA.",
  unauthorized: "Connecte-toi pour continuer.",
};

export function RentButton({ agentId, pricingModel, label, isAuthed }: RentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isAuthed) {
      router.push(`/login?next=/chat/${agentId}`);
      return;
    }
    if (pricingModel === "FREE") {
      router.push(`/chat/${agentId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(ERRORS[data.error] ?? "Erreur de paiement");
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleClick} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
