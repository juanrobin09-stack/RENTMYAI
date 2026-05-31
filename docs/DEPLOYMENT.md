# 🚀 Guide de déploiement RentMyAI

Guide simple pour mettre RentMyAI en ligne. Tu copies des clés depuis chaque
service et tu les colles dans **Vercel → Settings → Environment Variables**
(coche Production + Preview + Development), puis tu redéploies.

---

## 1. 🟢 Supabase (base de données) — 2 valeurs

1. supabase.com → ton projet → bouton vert **« Connect »**
2. Onglet **ORMs → Prisma**
3. Copie les 2 lignes affichées, remplace `[PASSWORD]` par le mot de passe de la base
   (Settings → Database → *Reset database password* si oublié).

```
DATABASE_URL="postgresql://postgres.xxxx:MOTDEPASSE@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxx:MOTDEPASSE@...pooler.supabase.com:5432/postgres"
```

> Les tables, pgvector, l'index et les catégories se créent **automatiquement**
> via `supabase/migrations/` (intégration GitHub Supabase). Rien d'autre à faire.

---

## 2. 🔐 Authentification — 3 valeurs

```
BETTER_AUTH_SECRET="<openssl rand -base64 32>"   # une longue chaîne aléatoire
BETTER_AUTH_URL="https://ton-site.vercel.app"     # ton URL Vercel (sans / final)
NEXT_PUBLIC_APP_URL="https://ton-site.vercel.app"  # même valeur
```

---

## 3. 🤖 IA — 2 valeurs

| Variable | Où | Format |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys (+ ajouter du crédit) | `sk-ant-...` |
| `VOYAGE_API_KEY` | dash.voyageai.com → API Keys | `pa-...` |

---

## 4. 📤 Upload PDF — 1 valeur

`UPLOADTHING_TOKEN` → uploadthing.com (login GitHub) → Dashboard → API Keys.

---

## 5. 💳 Stripe (paiements)

### Mode TEST (pour démarrer, sans vraie carte)
dashboard.stripe.com (bouton « Mode test » activé) :

| Variable | Où |
|---|---|
| `STRIPE_SECRET_KEY` | Developers → API keys → Secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Developers → Webhooks → Add endpoint (`whsec_...`) |

> Pas besoin de la clé « publishable » : le paiement se fait par redirection vers
> Stripe Checkout (côté serveur), donc seules ces 2 valeurs sont nécessaires.

**Carte de test** : `4242 4242 4242 4242`, date future, CVC `123`.

### Mode LIVE (production réelle)
**Aucun changement de code** — seules les clés changent :

1. Désactive « Mode test » → active ton compte (entreprise, IBAN, identité).
2. Active **Connect** en live (menu Connect → Get started → profil plateforme).
3. Récupère la clé **live** (`sk_live_...`).
4. Crée un webhook **live** : URL `https://ton-site.vercel.app/api/stripe/webhook`,
   events : `checkout.session.completed`, `invoice.paid`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `account.updated`
   → `STRIPE_WEBHOOK_SECRET` = `whsec_...` (live).
5. Mets les clés live dans Vercel (Production) → Redeploy.

> Stripe prélève ses frais (~1,5 % + 0,25 € en Europe) avant le partage.

---

## 6. 💰 Commission de la plateforme (optionnel)

```
PLATFORM_FEE_PERCENT="20"          # % que garde RentMyAI sur chaque vente (défaut 20)
AFFILIATE_COMMISSION_PERCENT="15"  # % reversé aux affiliés (défaut 15)
```

Aucun code à modifier : change juste ces variables dans Vercel.

### Comment l'argent circule
```
Client paie 19 € → Stripe → split automatique
   ├─ Créateur : 80 % (15,20 €) viré direct sur son compte
   └─ RentMyAI : 20 % (3,80 €) = ton revenu
```

---

## ✅ Checklist finale

- [ ] `DATABASE_URL` + `DIRECT_URL` (Supabase)
- [ ] `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL`
- [ ] `ANTHROPIC_API_KEY` + `VOYAGE_API_KEY`
- [ ] `UPLOADTHING_TOKEN`
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- [ ] (optionnel) `PLATFORM_FEE_PERCENT`, `AFFILIATE_COMMISSION_PERCENT`
- [ ] Redeploy sur Vercel
