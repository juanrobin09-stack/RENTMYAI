"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  agentId: string;
  agentName: string;
  welcomeMsg?: string | null;
  suggestions?: string[];
}

/**
 * Fenêtre de chat IA en streaming (Vercel AI SDK).
 * Envoie agentId au backend qui gère RAG + paywall + persistance.
 */
export function ChatWindow({
  agentId,
  agentName,
  welcomeMsg,
  suggestions = [],
}: ChatWindowProps) {
  const { messages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
      api: "/api/chat",
      body: { agentId },
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md pt-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{agentName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {welcomeMsg ?? "Pose ta première question pour commencer."}
            </p>
            {suggestions.length > 0 && (
              <div className="mt-6 grid gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => append({ role: "user", content: s })}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-left text-sm transition hover:border-primary/50 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-background/80 p-3 backdrop-blur md:p-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder={`Écris à ${agentName}…`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
