import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  const u = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return u?.role === "ADMIN" ? session.user.id : null;
}

const schema = z.object({
  type: z.enum(["agent", "user"]),
  id: z.string(),
  action: z.enum(["suspend", "unsuspend", "feature", "unfeature", "ban", "unban"]),
});

/** POST /api/admin — actions de modération (réservé ADMIN). */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return Response.json({ error: "forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "invalid_body" }, { status: 400 });
  const { type, id, action } = parsed.data;

  if (type === "agent") {
    const data =
      action === "suspend" ? { status: "SUSPENDED" as const }
      : action === "unsuspend" ? { status: "PUBLISHED" as const }
      : action === "feature" ? { featured: true }
      : action === "unfeature" ? { featured: false }
      : null;
    if (!data) return Response.json({ error: "invalid_action" }, { status: 400 });
    await db.agent.update({ where: { id }, data });
  } else {
    const data =
      action === "ban" ? { banned: true }
      : action === "unban" ? { banned: false }
      : null;
    if (!data) return Response.json({ error: "invalid_action" }, { status: 400 });
    await db.user.update({ where: { id }, data });
  }

  return Response.json({ ok: true });
}
