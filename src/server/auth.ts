import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Session courante (ou null) côté Server Component / Server Action. */
export async function getCurrentSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    // DB indisponible / config manquante : on ne fait pas crasher la page,
    // on considère l'utilisateur comme non connecté.
    console.error("[auth] getSession a échoué:", err);
    return null;
  }
}

/** Exige un utilisateur connecté, sinon redirige vers /login. */
export async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Exige un rôle minimal (USER < CREATOR < ADMIN). */
export async function requireRole(min: "CREATOR" | "ADMIN") {
  const user = await requireUser();
  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, email: true, name: true },
  });
  const order = { USER: 0, CREATOR: 1, ADMIN: 2 } as const;
  if (!full || order[full.role] < order[min]) redirect("/");
  return full;
}
