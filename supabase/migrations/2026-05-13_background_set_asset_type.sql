-- Migration: add 'background_set' to the user_design_assets asset_type enum.
-- Date: 2026-05-13
-- Purpose: Backing storage for the Background Studio Phase C layered composer.
-- Each saved row's config jsonb holds:
--   { name, canvasAspect, layers: BackgroundLayer[] }
-- BackgroundLayer is a discriminated union — see app/components/background-studio/studioTypes.ts.
--
-- Constraint replacement (Postgres won't let us ALTER a CHECK in place — drop+add).
-- Applied to production via Supabase MCP on 2026-05-13.

alter table public.user_design_assets
  drop constraint user_design_assets_asset_type_check;

alter table public.user_design_assets
  add constraint user_design_assets_asset_type_check
  check (asset_type in (
    'color_palette',
    'type_system',
    'token_set',
    'icon',
    'background_set'
  ));

comment on column public.user_design_assets.config is
  'Asset-type-specific JSON. For background_set: { name, canvasAspect, layers: BackgroundLayer[] }. See app/components/background-studio/studioTypes.ts.';
