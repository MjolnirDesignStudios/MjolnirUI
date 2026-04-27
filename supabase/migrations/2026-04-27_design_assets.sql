-- Migration: user_design_assets table
-- Date: 2026-04-27
-- Purpose: Store per-user saved design system artifacts (color palettes, type
-- systems, token sets, icons) for the MjolnirUI Foundations pages.
--
-- Tier-limit enforcement happens in the API layer (app/lib/designAssets.ts),
-- not in this schema, so limits can be tweaked without a migration.

-- ── Table ─────────────────────────────────────────────────
create table if not exists public.user_design_assets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  asset_type  text        not null check (asset_type in (
    'color_palette',
    'type_system',
    'token_set',
    'icon'
  )),
  name        text        not null,
  config      jsonb       not null,
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────
create index if not exists idx_user_design_assets_user
  on public.user_design_assets (user_id);

create index if not exists idx_user_design_assets_user_type
  on public.user_design_assets (user_id, asset_type);

-- ── updated_at auto-touch ─────────────────────────────────
create or replace function public.touch_user_design_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_design_assets_updated_at on public.user_design_assets;
create trigger trg_user_design_assets_updated_at
  before update on public.user_design_assets
  for each row execute function public.touch_user_design_assets_updated_at();

-- ── Row Level Security — users only see/edit their own ────
alter table public.user_design_assets enable row level security;

drop policy if exists "Users can view their own assets" on public.user_design_assets;
create policy "Users can view their own assets"
  on public.user_design_assets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own assets" on public.user_design_assets;
create policy "Users can insert their own assets"
  on public.user_design_assets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own assets" on public.user_design_assets;
create policy "Users can update their own assets"
  on public.user_design_assets for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own assets" on public.user_design_assets;
create policy "Users can delete their own assets"
  on public.user_design_assets for delete
  using (auth.uid() = user_id);

-- ── Comments ──────────────────────────────────────────────
comment on table public.user_design_assets is
  'Per-user saved design system artifacts (palettes, type systems, token sets, icons). Tier limits enforced in API layer.';
comment on column public.user_design_assets.config is
  'Asset-type-specific JSON. See app/lib/designAssets.ts for shape contracts.';
comment on column public.user_design_assets.is_default is
  'Marks one asset of a given type as the user''s default for that type.';
