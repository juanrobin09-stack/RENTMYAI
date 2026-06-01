import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// Rafraîchi toutes les heures pour inclure les nouveaux agents publiés.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1 },
    { url: `${base}/explore`, priority: 0.9 },
    { url: `${base}/pricing`, priority: 0.6 },
  ];

  // La DB peut être indisponible au build (ex. variables d'env non encore
  // configurées) : on ne fait jamais échouer le build pour autant.
  let agents: { slug: string; updatedAt: Date }[] = [];
  try {
    agents = await db.agent.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });
  } catch {
    return staticRoutes;
  }

  return [
    ...staticRoutes,
    ...agents.map((a) => ({
      url: `${base}/agents/${a.slug}`,
      lastModified: a.updatedAt,
      priority: 0.8,
    })),
  ];
}
