import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const agents = await db.agent.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    take: 5000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1 },
    { url: `${base}/explore`, priority: 0.9 },
    { url: `${base}/pricing`, priority: 0.6 },
  ];

  return [
    ...staticRoutes,
    ...agents.map((a) => ({
      url: `${base}/agents/${a.slug}`,
      lastModified: a.updatedAt,
      priority: 0.8,
    })),
  ];
}
