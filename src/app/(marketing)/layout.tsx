import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} RentMyAI. Tous droits réservés.</p>
          <nav className="flex gap-6">
            <Link href="/explore" className="hover:text-foreground">Explorer</Link>
            <Link href="/pricing" className="hover:text-foreground">Tarifs</Link>
            <Link href="/studio" className="hover:text-foreground">Créateurs</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
