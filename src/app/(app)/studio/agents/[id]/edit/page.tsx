import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { AgentEditForm } from "@/components/studio/agent-edit-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const agent = await db.agent.findUnique({
    where: { id },
    select: {
      id: true, name: true, tagline: true, description: true,
      systemPrompt: true, welcomeMsg: true, model: true, priceMonthly: true,
      pricingModel: true, creatorId: true,
    },
  });
  if (!agent || agent.creatorId !== user.id) notFound();

  return (
    <div className="container max-w-2xl py-12">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/studio"><ArrowLeft className="h-4 w-4" /> Studio</Link>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">Éditer l'IA</h1>
      <AgentEditForm agent={agent} />
    </div>
  );
}
