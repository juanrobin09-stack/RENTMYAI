import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@/lib/ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canAccessAgent } from "@/lib/access";
import { retrieveContext, buildContextBlock } from "@/lib/rag/retrieve";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  agentId: z.string().min(1),
  conversationId: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(8000),
      }),
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Validation
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const { agentId, conversationId, messages } = parsed.data;

  // 3. Contrôle d'accès (paywall)
  const access = await canAccessAgent(userId, agentId);
  if (!access.allowed) {
    return Response.json({ error: access.reason }, { status: 403 });
  }

  // 4. Charger l'agent
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: {
      systemPrompt: true,
      model: true,
      temperature: true,
      name: true,
    },
  });
  if (!agent) return Response.json({ error: "not_found" }, { status: 404 });

  // 5. RAG — récupérer le contexte pertinent à partir du dernier message user
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  // RAG optionnel : seulement si l'agent a des documents indexés.
  // Une indisponibilité de Voyage ne doit jamais casser le chat.
  let retrieved: Awaited<ReturnType<typeof retrieveContext>> = [];
  if (lastUser) {
    try {
      const chunkCount = await db.chunk.count({ where: { agentId } });
      if (chunkCount > 0) {
        retrieved = await retrieveContext(agentId, lastUser.content, 5);
      }
    } catch (err) {
      console.error("[chat] RAG indisponible, on continue sans contexte:", err);
    }
  }
  const contextBlock = buildContextBlock(retrieved);

  const systemPrompt = `Tu es "${agent.name}", une IA experte.\n${agent.systemPrompt}\n\nRègles : réponds en français, sois concret et actionnable, n'invente jamais de faits hors de ta base de connaissances.${contextBlock}`;

  // 6. Persister/charger la conversation
  let convId = conversationId;
  if (!convId) {
    const conv = await db.conversation.create({
      data: {
        userId,
        agentId,
        title: lastUser?.content.slice(0, 60) ?? "Nouvelle conversation",
      },
      select: { id: true },
    });
    convId = conv.id;
  }
  if (lastUser) {
    await db.message.create({
      data: { conversationId: convId, role: "USER", content: lastUser.content },
    });
  }

  // 7. Stream de la réponse
  const result = streamText({
    model: anthropic(agent.model),
    temperature: agent.temperature,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    async onFinish({ text, usage }) {
      await Promise.all([
        db.message.create({
          data: {
            conversationId: convId!,
            role: "ASSISTANT",
            content: text,
            tokens: usage?.totalTokens ?? 0,
            sources: retrieved.map((r) => r.id),
          },
        }),
        db.agent.update({
          where: { id: agentId },
          data: { usageCount: { increment: 1 } },
        }),
      ]);
    },
  });

  return result.toDataStreamResponse({
    headers: { "x-conversation-id": convId },
  });
}
