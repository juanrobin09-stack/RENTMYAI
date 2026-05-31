# 🌲 RentMyAI — Arborescence & Architecture technique

## Arborescence complète du projet

```
rentmyai/
├── prisma/
│   ├── schema.prisma              # ✅ Schéma complet (Auth, Agents, RAG, Paiement)
│   └── seed.ts                    # Catégories + agents de démo
│
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Pages publiques SEO
│   │   │   ├── page.tsx           # Landing premium
│   │   │   ├── pricing/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (marketplace)/
│   │   │   ├── explore/page.tsx           # Catalogue + filtres (ISR)
│   │   │   ├── agents/[slug]/page.tsx     # Fiche agent (SEO + JSON-LD)
│   │   │   └── categories/[slug]/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (app)/                 # Zone authentifiée
│   │   │   ├── chat/[agentId]/page.tsx    # Chat IA streaming
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx               # Dashboard utilisateur
│   │   │   │   ├── subscriptions/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   │
│   │   │   ├── studio/                    # Dashboard CRÉATEUR
│   │   │   │   ├── page.tsx               # Vue d'ensemble + revenus
│   │   │   │   ├── agents/page.tsx
│   │   │   │   ├── agents/new/page.tsx    # Création d'IA (wizard)
│   │   │   │   ├── agents/[id]/edit/page.tsx
│   │   │   │   ├── agents/[id]/documents/page.tsx  # Upload PDF + RAG
│   │   │   │   ├── earnings/page.tsx      # Revenus + payouts
│   │   │   │   └── connect/page.tsx       # Onboarding Stripe Connect
│   │   │   │
│   │   │   ├── affiliate/page.tsx         # Programme d'affiliation
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/                 # Back-office admin
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── agents/page.tsx
│   │   │   └── payouts/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts         # Better Auth handler
│   │   │   ├── chat/route.ts                  # Streaming chat + RAG
│   │   │   ├── agents/route.ts                # CRUD agents
│   │   │   ├── agents/[id]/route.ts
│   │   │   ├── documents/route.ts            # Trigger ingestion RAG
│   │   │   ├── reviews/route.ts
│   │   │   ├── uploadthing/route.ts          # UploadThing handler
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts         # Créer session checkout
│   │   │   │   ├── connect/route.ts          # Onboarding Connect
│   │   │   │   ├── portal/route.ts           # Billing portal
│   │   │   │   └── webhook/route.ts          # Webhooks Stripe
│   │   │   └── admin/.../route.ts
│   │   │
│   │   ├── layout.tsx             # Root layout + providers
│   │   ├── globals.css
│   │   ├── sitemap.ts             # SEO
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn (button, card, dialog, input…)
│   │   ├── marketing/             # Hero, Features, CTA, Footer
│   │   ├── marketplace/           # AgentCard, Filters, CategoryNav
│   │   ├── chat/                  # ChatWindow, Message, Composer, Sources
│   │   ├── studio/                # AgentWizard, DocumentUploader, RevenueChart
│   │   ├── dashboard/             # SubscriptionCard, UsageStats
│   │   ├── reviews/               # ReviewForm, ReviewList, Stars
│   │   └── shared/                # Navbar, UserMenu, ThemeToggle
│   │
│   ├── lib/
│   │   ├── db.ts                  # Prisma singleton
│   │   ├── auth.ts                # Config Better Auth (serveur)
│   │   ├── auth-client.ts         # Client Better Auth
│   │   ├── openai.ts              # Client OpenAI + helpers
│   │   ├── stripe.ts              # Client Stripe + Connect helpers
│   │   ├── uploadthing.ts         # File router
│   │   ├── rag/
│   │   │   ├── chunk.ts           # Découpage texte
│   │   │   ├── embed.ts           # Génération embeddings
│   │   │   ├── ingest.ts          # Pipeline PDF → chunks → vectors
│   │   │   └── retrieve.ts        # Similarity search pgvector
│   │   ├── affiliate.ts           # Tracking & commissions
│   │   ├── seo.ts                 # Helpers metadata + JSON-LD
│   │   ├── validations/           # Schémas Zod
│   │   └── utils.ts               # cn(), formatters
│   │
│   ├── hooks/                     # useChat, useAgent, useSubscription
│   ├── server/                    # Server actions (agents, billing…)
│   ├── types/
│   └── middleware.ts              # Auth guard + affiliate cookie
│
├── public/
├── components.json                # Config Shadcn
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── .env.example
├── package.json
└── README.md
```

## Mapping des 20 systèmes → implémentation

| # | Système | Emplacement principal |
|---|---|---|
| 1 | Architecture | ce document + `README.md` |
| 2 | Stack | `package.json` |
| 3 | Base de données | `prisma/schema.prisma` |
| 4 | Schéma Prisma | `prisma/schema.prisma` |
| 5 | Arborescence | ce document |
| 6–7 | Pages & API | `src/app/**` |
| 8 | Authentification | `lib/auth.ts`, `api/auth`, `middleware.ts` |
| 9 | Stripe Connect | `lib/stripe.ts`, `api/stripe/**` |
| 10 | Création d'IA | `studio/agents/new`, `api/agents` |
| 11 | Upload PDF | `lib/uploadthing.ts`, `api/uploadthing` |
| 12 | RAG | `lib/rag/**` |
| 13 | Chat IA | `app/(app)/chat`, `api/chat`, `components/chat` |
| 14 | Abonnement | `Subscription`, `api/stripe/checkout` |
| 15 | Marketplace | `app/(marketplace)/**` |
| 16 | Dashboard créateur | `app/(app)/studio/**` |
| 17 | Dashboard utilisateur | `app/(app)/dashboard/**` |
| 18 | Avis | `components/reviews`, `api/reviews` |
| 19 | Affiliation | `lib/affiliate.ts`, `app/(app)/affiliate` |
| 20 | Admin | `app/admin/**` |

## Décisions d'architecture clés

- **App Router + RSC** : pages marketplace en Server Components avec **ISR** → SEO + perf.
- **pgvector dans Postgres** (pas de vector DB séparée) : 1 seule source de vérité, moins d'ops, suffisant jusqu'à plusieurs M de chunks. Migration possible vers Pinecone/Qdrant si besoin d'échelle.
- **Stripe Connect Express** : onboarding KYC délégué, `destination charges` + `application_fee` pour le split automatique.
- **Vercel AI SDK** pour le streaming du chat (`useChat` + `streamText`).
- **Server Actions** pour les mutations simples ; **Route Handlers** pour webhooks, streaming et intégrations externes.
- **Sécurité** : Zod sur toutes les entrées, vérification d'ownership systématique, webhooks signés, RLS-like checks côté app, rate limiting sur `/api/chat`.
```
```
