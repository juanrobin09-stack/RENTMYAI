import { cn } from "@/lib/utils";

/**
 * Logo RentMyAI — monogramme géométrique "R" stylisé dans un losange,
 * avec dégradé violet→indigo. Rendu net à toute taille (SVG).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rma-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* Forme : carré arrondi avec un creux (cuvette d'IA) */}
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#rma-grad)" />
      {/* Monogramme R minimal en blanc */}
      <path
        d="M15 28V12h6.2c2.9 0 4.8 1.8 4.8 4.5 0 2-1.1 3.5-2.9 4.1L27 28h-3.6l-3.2-6.3H18V28h-3Zm3-9h3c1.2 0 2-.7 2-1.9 0-1.1-.8-1.8-2-1.8h-3v3.7Z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("group flex items-center gap-2.5 font-semibold", className)}>
      <LogoMark className="h-9 w-9 transition group-hover:scale-105" />
      <span className="text-[15px] tracking-tight">
        Rent<span className="text-gradient">MyAI</span>
      </span>
    </span>
  );
}
