# 🧠 RentMyAI

> **Crée une IA spécialisée à partir de tes connaissances, et loue-la.**
> La marketplace qui permet à n'importe quel expert de monétiser son savoir sous forme d'IA.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://prisma.io)
[![Stripe](https://img.shields.io/badge/Stripe-Connect-635BFF)](https://stripe.com/connect)

---

## 1. 📊 Analyse du marché

Le marché des **GPTs / AI agents** explose mais reste **non monétisable simplement** pour le créateur lambda :

| Acteur | Limite |
|---|---|
| **OpenAI GPT Store** | Pas de vrai partage de revenus, pas de paywall, pas de RAG privé profond |
| **Poe (Quora)** | Monétisation opaque, peu de contrôle créateur |
| **Character.ai** | Divertissement, pas d'expertise/business |
| **Custom dev** | 10–50k€, hors de portée d'un coach/expert solo |

**Insight clé** : des millions de **coachs, formateurs, consultants, créateurs** ont une expertise verticale (Tinder, muscu, immo, TikTok, business…) mais aucun moyen simple de la transformer en produit IA récurrent.

**TAM** : creator economy (~$250B) ∩ marché des LLM apps. **SOM réaliste** : verticales coaching/édu/conseil en Europe francophone d'abord.

## 2. 🥇 Avantages concurrentiels

1. **Monétisation native** — Stripe Connect, le créateur est payé automatiquement (abo ou one-time).
2. **RAG privé** — l'expert upload ses PDF/cours → l'IA répond *avec sa vraie méthode*, pas du GPT générique.
3. **No-code total** — créer une IA = nom + prompt + upload, 0 ligne de code.
4. **Marketplace SEO** — chaque agent = page indexée → acquisition organique.
5. **Effet réseau + affiliation** — chaque créateur ramène ses clients ; programme d'affiliation viral.
6. **Premium UX** — design type OpenAI × Stripe × Linear, mobile-first.

## 3. 💸 Business model

Plateforme **multi-sided** avec 3 sources de revenus :

| Source | Modèle | Détail |
|---|---|---|
| **Commission** | 20% sur chaque transaction | Sur abos & ventes one-time des créateurs |
| **Abonnement Pro créateur** (futur) | 19–49€/mois | Plus de docs, branding custom, analytics avancés |
| **Affiliation** | 15% reversé aux affiliés | Sur cookie 30j → croissance |

**Flux d'argent** :
```
Client paie 19€/mois pour "Coach Muscu IA"
  → Stripe Connect split automatique
      → Créateur reçoit 15,20€ (80%)
      → RentMyAI garde 3,80€ (20%)
      → (si affilié) une part de la commission plateforme va à l'affilié
```

**Unit economics** : marge brute élevée (coût = inference Claude + embeddings Voyage + infra, refacturé via le prix de l'agent).

## 4. 🏗️ Architecture globale

```
┌──────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js 15 (App Router) — RSC + Server Actions        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Marketplace │  │   Dashboards │  │  Chat (stream)│  │  │
│  │  │  (SEO/ISR)   │  │ créateur/user│  │   AI SDK      │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
   ┌────────────┬──────────┼───────────┬─────────────┬─────────┐
   ▼            ▼          ▼           ▼             ▼         ▼
┌──────┐  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐
│Better│  │ Prisma  │ │ Claude  │ │  Stripe  │ │UploadThing│ │pgvec │
│ Auth │  │Postgres │ │ chat +  │ │ Connect  │ │  (PDF)    │ │ RAG  │
│      │  │(Supabase)│ │ Voyage │ │ payouts  │ │           │ │      │
└──────┘  └─────────┘ └─────────┘ └──────────┘ └──────────┘ └──────┘
```

**Pipeline RAG** :
```
PDF upload (UploadThing)
  → webhook → parse (pdf-parse)
  → chunking (~800 tokens, overlap 100)
  → embeddings (Voyage AI · voyage-3.5 · 1024d)
  → stockage pgvector (table chunk)

Question user → embed query → similarity search (cosine, top-k)
  → contexte injecté dans systemPrompt → Claude stream → réponse + citations
```

## 5. 🗄️ Base de données

Schéma complet : [`prisma/schema.prisma`](./prisma/schema.prisma).

**Domaines** :
- **Auth** : `User`, `Session`, `Account`, `Verification` (Better Auth)
- **Marketplace** : `Category`, `Agent`
- **RAG** : `Document`, `Chunk` (vector 1024)
- **Chat** : `Conversation`, `Message`
- **Monétisation** : `Subscription`, `Purchase`, `Earning`, `Payout`
- **Social** : `Review`
- **Growth** : `Referral`

## 6. 🌲 Arborescence

Voir [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) pour l'arborescence complète et le mapping des 20 systèmes.

---

## 🚀 Démarrage

```bash
# 1. Installer
npm install

# 2. Configurer l'environnement
cp .env.example .env   # remplir DATABASE_URL/DIRECT_URL (Supabase) + clés

# 3. Client Prisma
npm run db:generate

# 4. Lancer
npm run dev
```

## 🟢 Déploiement Supabase (base de données)

Ce projet est câblé pour l'**intégration GitHub de Supabase** : le SQL du dossier
[`supabase/migrations/`](./supabase/migrations) est appliqué automatiquement à
chaque push sur la branche de production.

```
supabase/
├── config.toml                     # config projet + seed
├── seed.sql                        # catégories de la marketplace
└── migrations/
    └── 20260531000000_init.sql     # schéma complet + pgvector + index HNSW (1024d)
```

- **pgvector** est activé par la migration (`CREATE EXTENSION vector`).
- L'index **HNSW** cosinus sur `chunk.embedding` (Voyage 1024d) est créé par la migration.
- Prisma sert uniquement à **générer le client** et requêter (pas de `prisma migrate`,
  Supabase est propriétaire des migrations). Le SQL est généré depuis `schema.prisma`
  (source de vérité) via `prisma migrate diff`.

> Connexion Prisma ↔ Supabase : `DATABASE_URL` = Transaction Pooler (port **6543**,
> `?pgbouncer=true`), `DIRECT_URL` = Session/Direct (port **5432**). Voir `.env.example`.

## 🧱 Stack

**Frontend** : Next.js 15 · React 19 · TypeScript · TailwindCSS · Shadcn UI
**Backend** : Next.js API Routes / Server Actions · Prisma · PostgreSQL (pgvector)
**IA** : Claude (Anthropic) · Voyage AI (embeddings) · RAG · pgvector
**Paiement** : Stripe Connect
**Auth** : Better Auth
**Stockage** : UploadThing
**Déploiement** : Vercel

## 📍 Roadmap d'implémentation

- [x] Fondations : stratégie, schéma Prisma, arborescence
- [x] Scaffold Next.js + config (Tailwind, Shadcn, tsconfig)
- [x] Auth (Better Auth) + middleware
- [x] Lib core (db, ai/claude, voyage, stripe, rag, uploadthing)
- [x] Marketplace + pages publiques (SEO/ISR)
- [x] Création d'agent + upload PDF + pipeline RAG
- [x] Chat IA streaming
- [x] Stripe Connect : abos, one-time, payouts, webhooks
- [x] Dashboards créateur & utilisateur
- [x] Reviews · Affiliation · Admin

> Les 20 systèmes sont scaffoldés. Reste avant prod : `npm install`, créer le projet
> Supabase (migrations auto via GitHub), remplir les variables d'env Vercel, configurer
> le webhook Stripe, puis QA.
