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
      <footer className="border-t border-white/5">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} <span className="font-serif italic text-foreground">RentMyAI</span> — fait avec passion.</p>
          <nav className="flex gap-6">
            <Link href="/explore" className="transition hover:text-foreground">Explorer</Link>
            <Link href="/pricing" className="transition hover:text-foreground">Tarifs</Link>
            <Link href="/studio" className="transition hover:text-foreground">Créateurs</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
