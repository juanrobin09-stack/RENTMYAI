import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth";
import { canAccessAgent } from "@/lib/access";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const user = await requireUser();

  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, slug: true, welcomeMsg: true, suggestions: true },
  });
  if (!agent) notFound();

  const access = await canAccessAgent(user.id, agentId);
  if (!access.allowed) {
    // Paywall : renvoie vers la fiche pour s'abonner/acheter.
    if (access.reason === "subscription_required" || access.reason === "purchase_required") {
      return (
        <div className="container flex flex-col items-center py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Accès requis</h1>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Abonne-toi ou achète l'accès à <strong>{agent.name}</strong> pour discuter.
          </p>
          <Button className="mt-6" asChild>
            <Link href={`/agents/${agent.slug}`}>Voir les offres</Link>
          </Button>
        </div>
      );
    }
    redirect("/explore");
  }

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] max-w-3xl">
      <ChatWindow
        agentId={agent.id}
        agentName={agent.name}
        welcomeMsg={agent.welcomeMsg}
        suggestions={agent.suggestions}
      />
    </div>
  );
}
