import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/server/auth";

export async function Navbar() {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          RentMyAI
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/explore" className="transition hover:text-foreground">
            Explorer
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground">
            Tarifs
          </Link>
          <Link href="/studio" className="transition hover:text-foreground">
            Créer une IA
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
