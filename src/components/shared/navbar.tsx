import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/server/auth";
import { Logo } from "@/components/shared/logo";
import { MobileNav } from "@/components/shared/mobile-nav";

export async function Navbar() {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Accueil RentMyAI">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link href="/explore" className="transition hover:text-foreground">Explorer</Link>
          <Link href="/pricing" className="transition hover:text-foreground">Tarifs</Link>
          <Link href="/studio" className="transition hover:text-foreground">Créer une IA</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/studio">Studio</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Commencer</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <MobileNav isAuthed={Boolean(user)} />
      </div>
    </header>
  );
}
