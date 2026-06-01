import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/server/auth";
import { db } from "@/lib/db";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/studio", label: "Studio" },
  { href: "/explore", label: "Explorer" },
];

/** Barre de navigation de l'espace connecté (distincte du marketing). */
export async function AppNav() {
  const session = await getCurrentSession();
  const user = session?.user;

  let isAdmin = false;
  if (user) {
    const full = await db.user
      .findUnique({ where: { id: user.id }, select: { role: true } })
      .catch(() => null);
    isAdmin = full?.role === "ADMIN";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" aria-label="Tableau de bord">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/studio/agents/new">+ Nouvelle IA</Link>
          </Button>
          {user ? (
            <UserMenu name={user.name} email={user.email} isAdmin={isAdmin} />
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
