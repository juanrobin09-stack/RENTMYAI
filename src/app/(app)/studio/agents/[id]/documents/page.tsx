import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { DocumentUploader } from "@/components/studio/document-uploader";
import { PublishButton } from "@/components/studio/publish-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const agent = await db.agent.findUnique({
    where: { id },
    select: {
      id: true, name: true, creatorId: true, status: true,
      documents: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, status: true, error: true, _count: { select: { chunks: true } } },
      },
    },
  });
  if (!agent || agent.creatorId !== user.id) notFound();

  return (
    <div className="container max-w-2xl py-12">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/studio"><ArrowLeft className="h-4 w-4" /> Studio</Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <Badge variant={agent.status === "PUBLISHED" ? "success" : "secondary"}>
              {agent.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
            </Badge>
          </div>
          <p className="text-muted-foreground">Sources de connaissances (RAG)</p>
        </div>
        <PublishButton agentId={agent.id} published={agent.status === "PUBLISHED"} />
      </div>

      <div className="mt-8">
        <DocumentUploader agentId={agent.id} initial={agent.documents} />
      </div>
    </div>
  );
}
