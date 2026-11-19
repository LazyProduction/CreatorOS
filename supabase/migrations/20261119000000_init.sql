-- CreatorOS — schéma initial
-- Profils créateurs, crédits IA, pipeline Kanban, projets, générations IA, publications.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create or replace function public.plan_monthly_credits(p_plan text)
returns integer
language sql
immutable
as $$
  select case p_plan
    when 'creator' then 300
    when 'pro' then 1200
    else 30
  end;
$$;

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  niche text,
  content_types text[] not null default '{}',
  platforms text[] not null default '{youtube}',
  target_audience text,
  voice_notes text,
  language text not null default 'fr',
  theme_accent text not null default '#8b5cf6',
  theme_mode text not null default 'dark' check (theme_mode in ('dark', 'light')),
  onboarded boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro')),
  -- Crédits mensuels (réinitialisés à chaque période) + crédits achetés (n'expirent pas)
  monthly_credits integer not null default 30 check (monthly_credits >= 0),
  bonus_credits integer not null default 0 check (bonus_credits >= 0),
  credits_period_end timestamptz not null default (now() + interval '1 month'),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  discord_webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Les utilisateurs ne peuvent modifier que les champs non sensibles (voir trigger).
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Empêche un utilisateur de modifier lui-même son plan, ses crédits ou Stripe.
create or replace function public.protect_profile_billing()
returns trigger
language plpgsql
as $$
begin
  -- current_user vaut 'authenticated' pour les requêtes directes des clients (PostgREST),
  -- et le propriétaire de la fonction dans les fonctions security definer.
  if current_user in ('authenticated', 'anon') then
    new.plan := old.plan;
    new.monthly_credits := old.monthly_credits;
    new.bonus_credits := old.bonus_credits;
    new.credits_period_end := old.credits_period_end;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.subscription_status := old.subscription_status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_billing
  before update on public.profiles
  for each row execute function public.protect_profile_billing();

-- ---------------------------------------------------------------------------
-- Étapes du pipeline (colonnes Kanban personnalisables)
-- ---------------------------------------------------------------------------
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null default '#8b5cf6',
  position integer not null default 0,
  is_published_stage boolean not null default false,
  created_at timestamptz not null default now()
);

create index pipeline_stages_user_idx on public.pipeline_stages (user_id, position);
alter table public.pipeline_stages enable row level security;

create policy "stages_all_own" on public.pipeline_stages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Projets (une vidéo / un contenu)
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  position double precision not null default 0,
  title text not null default 'Nouveau projet' check (char_length(title) <= 200),
  brief text not null default '',
  platform text not null default 'youtube',
  format text not null default 'long' check (format in ('long', 'short', 'post', 'live')),
  tone text not null default 'dynamique',
  -- Contenu retenu par le créateur
  chosen_title text,
  chosen_hook text,
  script text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  -- Dates
  due_date date,
  publish_at timestamptz,
  published_at timestamptz,
  published_url text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_idx on public.projects (user_id, archived, stage_id, position);
create index projects_publish_idx on public.projects (user_id, publish_at);
alter table public.projects enable row level security;

create policy "projects_all_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Générations IA (historique + suivi des coûts)
-- ---------------------------------------------------------------------------
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  kind text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  credits_used integer not null default 0,
  model text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index generations_user_idx on public.generations (user_id, created_at desc);
create index generations_project_idx on public.generations (project_id, kind, created_at desc);
alter table public.generations enable row level security;

create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);
create policy "generations_delete_own" on public.generations
  for delete using (auth.uid() = user_id);
-- Insertion uniquement côté serveur (service role) après débit des crédits.

-- ---------------------------------------------------------------------------
-- Publications (suivi multi-plateformes)
-- ---------------------------------------------------------------------------
create table public.publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  platform text not null,
  url text,
  published_at timestamptz not null default now(),
  views integer,
  likes integer,
  comments integer,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index publications_user_idx on public.publications (user_id, published_at desc);
alter table public.publications enable row level security;

create policy "publications_all_own" on public.publications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Événements Stripe déjà traités (idempotence du webhook)
-- ---------------------------------------------------------------------------
create table public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- ---------------------------------------------------------------------------
-- Création du profil + étapes par défaut à l'inscription
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.pipeline_stages (user_id, name, color, position, is_published_stage) values
    (new.id, 'Idées', '#a1a1aa', 0, false),
    (new.id, 'Écriture', '#60a5fa', 1, false),
    (new.id, 'Tournage', '#f59e0b', 2, false),
    (new.id, 'Montage', '#ec4899', 3, false),
    (new.id, 'Prêt à publier', '#22c55e', 4, false),
    (new.id, 'Publié', '#8b5cf6', 5, true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Crédits
-- ---------------------------------------------------------------------------

-- Réinitialise les crédits mensuels si la période est terminée. Retourne le solde total.
create or replace function public.refresh_credits(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  update public.profiles
     set monthly_credits = public.plan_monthly_credits(plan),
         credits_period_end = case
           when credits_period_end + interval '1 month' > now() then credits_period_end + interval '1 month'
           else now() + interval '1 month'
         end
   where id = p_user
     and credits_period_end <= now()
     -- Les abonnés payants sont réinitialisés par Stripe (invoice.paid)
     and (plan = 'free' or subscription_status is distinct from 'active');

  select monthly_credits + bonus_credits into v_total from public.profiles where id = p_user;
  return coalesce(v_total, 0);
end;
$$;

-- Débit atomique : consomme d'abord les crédits mensuels, puis les crédits achetés.
-- Retourne le solde restant, ou null si le solde est insuffisant.
create or replace function public.consume_credits(p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_monthly integer;
  v_bonus integer;
  v_from_monthly integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_amount is null or p_amount < 1 or p_amount > 100 then
    raise exception 'invalid amount';
  end if;

  perform public.refresh_credits(v_user);

  select monthly_credits, bonus_credits into v_monthly, v_bonus
    from public.profiles where id = v_user for update;

  if v_monthly is null or v_monthly + v_bonus < p_amount then
    return null;
  end if;

  v_from_monthly := least(v_monthly, p_amount);
  update public.profiles
     set monthly_credits = monthly_credits - v_from_monthly,
         bonus_credits = bonus_credits - (p_amount - v_from_monthly)
   where id = v_user;

  return v_monthly + v_bonus - p_amount;
end;
$$;

-- Rembourse des crédits (ex : échec de l'appel IA après débit). Réservé au serveur.
create or replace function public.refund_credits(p_user uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set bonus_credits = bonus_credits + greatest(p_amount, 0) where id = p_user;
$$;

create or replace function public.get_credits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return 0;
  end if;
  return public.refresh_credits(auth.uid());
end;
$$;

revoke all on function public.refresh_credits(uuid) from public, anon, authenticated;
revoke all on function public.refund_credits(uuid, integer) from public, anon, authenticated;
revoke all on function public.consume_credits(integer) from public, anon;
revoke all on function public.get_credits() from public, anon;
grant execute on function public.consume_credits(integer) to authenticated;
grant execute on function public.get_credits() to authenticated;
grant execute on function public.refresh_credits(uuid) to service_role;
grant execute on function public.refund_credits(uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Réordonnancement Kanban en une seule requête
-- ---------------------------------------------------------------------------
create or replace function public.move_project(p_project uuid, p_stage uuid, p_position double precision)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_published boolean;
begin
  select is_published_stage into v_published from public.pipeline_stages
   where id = p_stage and user_id = auth.uid();
  if v_published is null then
    raise exception 'stage not found';
  end if;

  update public.projects
     set stage_id = p_stage,
         position = p_position,
         published_at = case when v_published then coalesce(published_at, now()) else published_at end
   where id = p_project and user_id = auth.uid();
end;
$$;

grant execute on function public.move_project(uuid, uuid, double precision) to authenticated;
