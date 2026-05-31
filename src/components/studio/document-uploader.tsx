"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2, RefreshCw, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Doc {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  error: string | null;
  _count: { chunks: number };
}

export function DocumentUploader({ agentId, initial }: { agentId: string; initial: Doc[] }) {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>(initial);

  const { startUpload, isUploading } = useUploadThing("agentDocument", {
    onClientUploadComplete: () => {
      toast.success("PDF uploadé. Indexation RAG en cours…");
      router.refresh();
    },
    onUploadError: (e) => {
      toast.error(e.message);
    },
  });

  async function action(documentId: string, type: "reingest" | "delete") {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, action: type }),
    });
    if (!res.ok) return toast.error("Action impossible");
    if (type === "delete") setDocs((d) => d.filter((x) => x.id !== documentId));
    else toast.success("Ré-indexation lancée");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition hover:border-primary/50">
        <input
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) startUpload(files, { agentId });
          }}
        />
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-3 font-medium">Glisse tes PDF ici</p>
        <p className="text-sm text-muted-foreground">Max 16 Mo · 10 fichiers</p>
      </label>

      <div className="space-y-2">
        {docs.map((d) => (
          <Card key={d.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d._count.chunks} extraits indexés</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={d.status} />
              <Button size="icon" variant="ghost" onClick={() => action(d.id, "reingest")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => action(d.id, "delete")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Doc["status"] }) {
  if (status === "READY") return <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Prêt</Badge>;
  if (status === "FAILED") return <Badge variant="warning"><XCircle className="mr-1 h-3 w-3" />Échec</Badge>;
  return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Traitement</Badge>;
}
