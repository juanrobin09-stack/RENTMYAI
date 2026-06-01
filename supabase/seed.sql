-- RentMyAI — Seed Supabase : catégories de la marketplace.
-- Idempotent (ON CONFLICT sur slug). id généré côté DB (gen_random_uuid).
-- `icon` = clé d'icône Lucide (rendue côté UI), pas un emoji.

INSERT INTO "category" ("id", "name", "slug", "icon", "createdAt") VALUES
  (gen_random_uuid()::text, 'Séduction & Dating',          'dating',     'heart',          now()),
  (gen_random_uuid()::text, 'Sport & Musculation',         'fitness',    'dumbbell',       now()),
  (gen_random_uuid()::text, 'Immobilier',                  'immobilier', 'home',           now()),
  (gen_random_uuid()::text, 'Business & Entrepreneuriat',  'business',   'trending-up',    now()),
  (gen_random_uuid()::text, 'Éducation',                   'education',  'graduation-cap', now()),
  (gen_random_uuid()::text, 'Réseaux sociaux',             'social',     'smartphone',     now()),
  (gen_random_uuid()::text, 'Finance & Investissement',    'finance',    'wallet',         now()),
  (gen_random_uuid()::text, 'Développement personnel',     'mindset',    'brain',          now())
ON CONFLICT ("slug") DO NOTHING;
