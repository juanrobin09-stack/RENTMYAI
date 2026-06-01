"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isAuthed: boolean;
}

const LINKS = [
  { href: "/explore", label: "Explorer" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/studio", label: "Créer une IA" },
];

export function MobileNav({ isAuthed }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="font-semibold">Menu</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-4 text-lg font-medium transition hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 px-6">
            {isAuthed ? (
              <>
                <Button variant="outline" className="h-12 text-base" asChild onClick={() => setOpen(false)}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button className="h-12 text-base" asChild onClick={() => setOpen(false)}>
                  <Link href="/studio">Studio</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="h-12 text-base" asChild onClick={() => setOpen(false)}>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button className="h-12 text-base" asChild onClick={() => setOpen(false)}>
                  <Link href="/register">Commencer</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
