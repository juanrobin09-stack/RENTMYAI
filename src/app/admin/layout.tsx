import Link from "next/link";
import { Shield } from "lucide-react";
import { requireRole } from "@/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN"); // garde : redirige si non-admin

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4" /> Admin
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">Vue d'ensemble</Link>
            <Link href="/admin/agents" className="hover:text-foreground">Agents</Link>
            <Link href="/admin/users" className="hover:text-foreground">Utilisateurs</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
