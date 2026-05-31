-- RentMyAI — Seed Supabase : catégories de la marketplace.
-- Idempotent (ON CONFLICT sur slug). id généré côté DB (gen_random_uuid).

INSERT INTO "category" ("id", "name", "slug", "icon", "createdAt") VALUES
  (gen_random_uuid()::text, 'Séduction & Dating',          'dating',     '💘', now()),
  (gen_random_uuid()::text, 'Sport & Musculation',         'fitness',    '💪', now()),
  (gen_random_uuid()::text, 'Immobilier',                  'immobilier', '🏠', now()),
  (gen_random_uuid()::text, 'Business & Entrepreneuriat',  'business',   '📈', now()),
  (gen_random_uuid()::text, 'Éducation',                   'education',  '🎓', now()),
  (gen_random_uuid()::text, 'Réseaux sociaux',             'social',     '📱', now()),
  (gen_random_uuid()::text, 'Finance & Investissement',    'finance',    '💰', now()),
  (gen_random_uuid()::text, 'Développement personnel',     'mindset',    '🧠', now())
ON CONFLICT ("slug") DO NOTHING;
