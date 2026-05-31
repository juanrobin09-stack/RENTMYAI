import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES = [
  { name: "Séduction & Dating", slug: "dating", icon: "💘" },
  { name: "Sport & Musculation", slug: "fitness", icon: "💪" },
  { name: "Immobilier", slug: "immobilier", icon: "🏠" },
  { name: "Business & Entrepreneuriat", slug: "business", icon: "📈" },
  { name: "Éducation", slug: "education", icon: "🎓" },
  { name: "Réseaux sociaux", slug: "social", icon: "📱" },
  { name: "Finance & Investissement", slug: "finance", icon: "💰" },
  { name: "Développement personnel", slug: "mindset", icon: "🧠" },
];

async function main() {
  console.log("🌱 Seeding catégories…");
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, icon: c.icon },
    });
  }
  console.log(`✅ ${CATEGORIES.length} catégories prêtes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
