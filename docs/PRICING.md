# Tarifs et rentabilité des crédits

## Coût réel d'une génération (tarifs Anthropic, novembre 2026)

| Modèle | Entrée / 1M tokens | Sortie / 1M tokens | Utilisé pour |
|---|---|---|---|
| Claude Haiku 5.5 | 0,10 $ | 0,50 $ | idées, titres, hooks, description, tags, promo |
| Claude Sonnet 5.5 | 2 $ | 10 $ | script, kit complet, branding |

Le prompt système commun est mis en cache (lecture à prix réduit).

| Génération | Crédits | Tokens typiques (entrée / sortie) | Coût estimé | Coût par crédit |
|---|---|---|---|---|
| Titres, hooks, tags… (Haiku) | 1 | 1 500 / 800 | ≈ 0,06 cent | ≈ 0,06 cent |
| Script long (Sonnet) | 3 | 2 500 / 3 500 | ≈ 4 cents | ≈ 1,3 cent |
| Kit complet (Sonnet) | 4 | 2 000 / 2 500 | ≈ 3 cents | ≈ 0,75 cent |
| Branding (Sonnet) | 3 | 1 500 / 2 000 | ≈ 2,3 cents | ≈ 0,8 cent |

La réflexion adaptative (thinking) ajoute des tokens de sortie selon la difficulté : compte une marge de x1,5 sur les tâches Sonnet. **Pire cas réaliste : environ 2 cents par crédit**, cas moyen bien en dessous de 1 cent.

## Plans

| Plan | Prix | Crédits / mois | Coût IA pire cas | Frais Stripe | Marge pire cas |
|---|---|---|---|---|---|
| Gratuit | 0 € | 30 | ≈ 0,60 € | 0 | coût d'acquisition |
| Créateur | 9,99 € | 300 | ≈ 6 € | ≈ 0,40 € | ≈ 36 % |
| Pro | 24,99 € | 1 200 | ≈ 24 € | ≈ 0,60 € | à surveiller |

En pratique, la majorité des crédits part dans des tâches Haiku (quasi gratuites) et la plupart des abonnés n'utilisent pas tout leur quota : la marge moyenne attendue est **supérieure à 80 %**. Le tableau `generations` enregistre les tokens de chaque appel : surveille le coût réel par plan dès les premiers clients, et ajuste si besoin les coûts en crédits dans `src/lib/ai/kinds.ts` (par exemple script à 4 crédits).

Recharges : 100 crédits à 4,99 € et 500 à 19,99 € (crédits sans expiration).

## Plus tard : génération d'images

Une miniature ou un logo coûte environ 4 à 8 cents selon le modèle d'image : prévoir 10 crédits par image pour garder la même marge.
