# CreatorOS

L'espace de travail IA des créateurs de contenu : idées, titres, hooks, scripts, descriptions, tags, posts de promo et branding générés par Claude, puis pipeline Kanban, téléprompteur, calendrier et suivi des publications.

**Stack** : Next.js 16 (App Router) · Supabase (Postgres, Auth, RLS) · Stripe · Anthropic (Claude Haiku 5.5 + Sonnet 5.5) · Tailwind CSS 4 · dnd-kit.

## Fonctionnalités (MVP)

| Module | Gratuit | Crédits IA |
|---|---|---|
| Onboarding + profil créateur (niche, univers, plateformes, style) | ✓ | |
| Thèmes : 11 couleurs d'accent + couleur libre, mode sombre / clair | ✓ | |
| Projets (brief, titre, hook, script, description, tags, checklist, dates, notes) | ✓ | |
| Pipeline Kanban drag and drop, étapes personnalisables | ✓ | |
| Calendrier éditorial + suivi des publications (vues, j'aime, commentaires) | ✓ | |
| Téléprompteur (vitesse, taille, miroir, plein écran, raccourcis clavier) | ✓ | |
| Partage Discord par webhook | ✓ | |
| Idées, titres, hooks, description SEO, tags, posts de promo | | 1 |
| Script complet, branding de chaîne | | 3 |
| Kit vidéo complet | | 4 |

## Démarrer en local

Prérequis : Node 20+, Docker (pour Supabase en local).

```bash
npm install
npx supabase start            # lance Postgres + Auth en local et applique supabase/migrations
cp .env.example .env.local    # puis colle les clés affichées par `npx supabase status`
npm run dev
```

Sans `ANTHROPIC_API_KEY` (ou avec `AI_DEMO_MODE=true`), l'IA renvoie des exemples et ne débite aucun crédit : pratique pour tester l'interface.

## Mise en production

1. **Supabase** : crée un projet (région UE), puis `npx supabase link --project-ref <ref>` et `npx supabase db push` pour appliquer le schéma.
   Dans Authentication → URL Configuration : Site URL = ton domaine, Redirect URLs = `https://ton-domaine/auth/callback`.
   Pour Google : Authentication → Providers → Google (client OAuth Google Cloud).
2. **Stripe** : crée 2 produits d'abonnement (Créateur, Pro) avec un prix mensuel et annuel chacun, et 2 produits ponctuels (100 et 500 crédits). Reporte les `price_...` dans les variables `STRIPE_PRICE_*`.
   Webhook : `https://ton-domaine/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.
   Active le portail client (Settings → Billing → Customer portal) pour permettre de changer de plan et d'annuler.
3. **Anthropic** : crée une clé sur console.anthropic.com, mets `ANTHROPIC_API_KEY` et `AI_DEMO_MODE=false`.
4. **Vercel** : importe le dépôt, ajoute toutes les variables de `.env.example`, déploie.
5. Complète les pages légales (`src/app/(marketing)/mentions-legales`, `cgv`, `confidentialite`).

## Architecture

```
src/
  app/
    (marketing)/     landing, tarifs, pages légales
    (auth)/          connexion, inscription, mot de passe
    (app)/           espace connecté : dashboard, studio, pipeline, projects, calendar, teleprompter, settings
    onboarding/      parcours de bienvenue
    actions/         server actions (projets, étapes, IA, profil, publications, facturation)
    api/stripe/webhook
  lib/
    ai/              kinds.ts (coûts + schémas), prompts.ts, run.ts (débit atomique, appel Claude, remboursement), demo.ts
    supabase/        clients navigateur / serveur / service role
    plans.ts, theme.ts, stripe.ts, platforms.ts, types.ts
  proxy.ts           rafraîchit la session et protège les routes
supabase/migrations  schéma, RLS, fonctions de crédits
```

Sécurité : RLS sur toutes les tables ; un trigger empêche un utilisateur de modifier son plan ou ses crédits ; le débit des crédits est atomique (`consume_credits`) et remboursé si l'IA échoue ; le webhook Stripe est vérifié et idempotent.

Voir aussi [docs/ROADMAP.md](docs/ROADMAP.md) et [docs/PRICING.md](docs/PRICING.md).
