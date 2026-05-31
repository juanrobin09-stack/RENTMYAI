"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectButton({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return toast.error("Impossible de démarrer l'onboarding");
    }
    window.location.href = data.url;
  }

  return (
    <Button onClick={onClick} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {enabled ? "Gérer mon compte Stripe" : "Activer les paiements"}
    </Button>
  );
}
