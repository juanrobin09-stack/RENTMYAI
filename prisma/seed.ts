import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// `icon` = clé d'icône Lucide (rendue côté UI), pas un emoji.
const CATEGORIES = [
  { name: "Séduction & Dating", slug: "dating", icon: "heart" },
  { name: "Sport & Musculation", slug: "fitness", icon: "dumbbell" },
  { name: "Immobilier", slug: "immobilier", icon: "home" },
  { name: "Business & Entrepreneuriat", slug: "business", icon: "trending-up" },
  { name: "Éducation", slug: "education", icon: "graduation-cap" },
  { name: "Réseaux sociaux", slug: "social", icon: "smartphone" },
  { name: "Finance & Investissement", slug: "finance", icon: "wallet" },
  { name: "Développement personnel", slug: "mindset", icon: "brain" },
];

async function main() {
  console.log("Seeding categories...");
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, icon: c.icon },
    });
  }
  console.log(`${CATEGORIES.length} categories ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
