import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [subs, conversations] = await Promise.all([
    db.subscription.findMany({
      where: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { agent: { select: { id: true, name: true, slug: true } } },
    }),
    db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { agent: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Bonjour {user.name ?? ""}</h1>
      <p className="text-muted-foreground">Tes IA et conversations</p>

      <h2 className="mt-10 text-lg font-semibold">Mes abonnements</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subs.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
            Aucun abonnement.{" "}
            <Link href="/explore" className="font-medium text-foreground hover:underline">Explorer les IA</Link>
          </Card>
        )}
        {subs.map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-medium">{s.agent.name}</span>
            </div>
            <Button size="sm" asChild>
              <Link href={`/chat/${s.agent.id}`}>Chatter</Link>
            </Button>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Conversations récentes</h2>
      <div className="mt-4 space-y-2">
        {conversations.map((c) => (
          <Link key={c.id} href={`/chat/${c.agent.id}`}>
            <Card className="flex items-center gap-3 p-4 transition hover:border-primary/40">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{c.title ?? "Conversation"}</span>
              <span className="text-xs text-muted-foreground">{c.agent.name}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
