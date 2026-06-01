"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Sparkles, CreditCard, Gift, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface UserMenuProps {
  name?: string | null;
  email: string;
  isAdmin?: boolean;
}

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const initial = (name || email).charAt(0).toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const items = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/studio", label: "Studio créateur", icon: Sparkles },
    { href: "/dashboard/subscriptions", label: "Mes abonnements", icon: CreditCard },
    { href: "/affiliate", label: "Affiliation", icon: Gift },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 transition hover:bg-white/10"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white">
          {initial}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{name ?? "Mon compte"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="my-1 h-px bg-white/5" />
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            >
              <it.icon className="h-4 w-4 text-muted-foreground" />
              {it.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Administration
            </Link>
          )}
          <div className="my-1 h-px bg-white/5" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
