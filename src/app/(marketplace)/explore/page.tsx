import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AgentCard } from "@/components/marketplace/agent-card";
import { Prisma } from "@prisma/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explorer les IA",
  description:
    "Découvre des IA expertes créées par des coachs et spécialistes : Tinder, musculation, immobilier, business, TikTok et plus.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;

  const where: Prisma.AgentWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tagline: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.AgentOrderByWithRelationInput =
    sort === "top"
      ? { ratingAvg: "desc" }
      : sort === "new"
        ? { publishedAt: "desc" }
        : { usageCount: "desc" };

  const [agents, categories] = await Promise.all([
    db.agent
      .findMany({
        where,
        orderBy,
        take: 48,
        select: {
          slug: true, name: true, tagline: true, avatar: true,
          pricingModel: true, priceMonthly: true, priceOneTime: true,
          ratingAvg: true, ratingCount: true, usageCount: true,
          category: { select: { name: true } },
        },
      })
      .catch(() => []),
    db.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Explorer les IA</h1>
      <p className="mt-2 text-muted-foreground">
        {agents.length} IA expertes prêtes à t'aider
      </p>

      {/* Filtres catégories */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/explore"
          className={`rounded-full border px-4 py-1.5 text-sm transition hover:bg-accent ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          Tout
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/explore?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition hover:bg-accent ${category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((a) => (
          <AgentCard key={a.slug} agent={a} />
        ))}
      </div>

      {agents.length === 0 && (
        <p className="py-24 text-center text-muted-foreground">
          Aucune IA trouvée. Sois le premier à en créer une !
        </p>
      )}
    </div>
  );
}
