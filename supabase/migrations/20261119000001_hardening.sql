-- Durcissement signalé par l'analyseur de sécurité Supabase.
alter function public.plan_monthly_credits(text) set search_path = public;
alter function public.protect_profile_billing() set search_path = public;
alter function public.touch_updated_at() set search_path = public;

-- Le trigger d'inscription ne doit pas être appelable via l'API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- stripe_events : accès réservé au service role (aucune policy volontairement).
comment on table public.stripe_events is 'Idempotence du webhook Stripe. Accès service role uniquement.';
