"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishButton({ agentId, published }: { agentId: string; published: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function publish() {
    setLoading(true);
    const res = await fetch(`/api/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      if (data.error === "connect_required") {
        toast.error("Active d'abord les paiements Stripe (Studio → Activer Stripe).");
      } else {
        toast.error("Publication impossible");
      }
      return;
    }
    toast.success("IA publiée avec succès");
    router.refresh();
  }

  if (published) return null;
  return (
    <Button onClick={publish} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
      Publier
    </Button>
  );
}
