# Feuille de route

## Phase 1 — MVP vendable (livré dans ce dépôt)
- Auth email + Google, onboarding, profil créateur
- Projets de A à Z avec génération IA (idées, titres, hooks, script, description, tags, promo, kit, branding)
- Pipeline Kanban, calendrier, suivi des publications, checklist
- Téléprompteur
- Abonnements Stripe + crédits + recharges, plan gratuit utile
- Thèmes de couleurs, mode clair / sombre
- Partage Discord par webhook

Avant la vente : clé Anthropic, projet Supabase de prod, produits Stripe, domaine, pages légales, emails transactionnels (SMTP personnalisé dans Supabase, par exemple Resend).

## Phase 2 — Analyse (mois 2 et 3)
- Connexion YouTube (OAuth Google, YouTube Data API + Analytics API) : import des vidéos, stats, commentaires
- Analyse IA : « pourquoi cette vidéo a marché », synthèse des commentaires, idées tirées des questions de l'audience
- Partage automatique à la publication (Discord, puis X et LinkedIn via leurs API)
- Assistant IA conversationnel qui connaît tes projets et tes stats

## Phase 3 — Visuel et croissance
- Génération de miniatures, logos, bannières
- Découpe automatique d'une vidéo longue en 5 à 6 shorts (transcription + détection des meilleurs moments)
- Veille concurrentielle : analyse des chaînes similaires et des formats qui marchent
- TikTok et Instagram (validation des API Meta et TikTok : plusieurs semaines, à lancer tôt)

## Phase 4 — Mobile
- Application mobile (Expo / React Native) réutilisant Supabase et les server actions via une API
