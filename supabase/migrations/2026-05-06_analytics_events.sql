-- Migration: analytics_events table
-- Date: 2026-05-06
-- Purpose: Track user activity (page views, tool opens, component clicks,
-- save events) for the MjolnirUI admin dashboard's Popular Tools + Activity
-- panels, and for the MDS cross-project metrics feed.
--
-- Design notes:
--   - Append-only. Events never updated; deletes only via retention policy.
--   - jsonb payload keeps the schema flexible across event types.
--   - RLS: users can INSERT their own events; only service-role / admins
--     can SELECT (no per-user history view yet).
--   - Indexes target the two main query patterns: aggregate by event_type
--     within a time window, and per-user lookups.

create table if not exists public.analytics_events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  event_type  text        not null check (event_type in (
    'page_view',
    'tool_open',
    'component_click',
    'save_asset',
    'export_action',
    'upgrade_click'
  )),
  payload     jsonb       not null default '{}'::jsonb,
  user_tier   text,                    -- snapshotted at event time for cohort analysis
  user_role   text,                    -- snapshotted at event time
  session_id  text,                    -- optional, for funnel grouping
  created_at  timestamptz not null default now()
);

-- Aggregate by event_type within a time window (Popular Tools, activity timeline)
create index if not exists idx_analytics_events_type_time
  on public.analytics_events (event_type, created_at desc);

-- Per-user activity lookups
create index if not exists idx_analytics_events_user_time
  on public.analytics_events (user_id, created_at desc);

-- Tool-specific aggregations (jsonb payload->>'tool' is the canonical key)
create index if not exists idx_analytics_events_tool
  on public.analytics_events ((payload->>'tool'), created_at desc)
  where event_type = 'tool_open';

-- ── Row Level Security ────────────────────────────────────
alter table public.analytics_events enable row level security;

-- Users can insert their own events (auth.uid() must match user_id)
drop policy if exists "Users insert own analytics events" on public.analytics_events;
create policy "Users insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

-- Anonymous events allowed (page_view from logged-out visitors) — user_id null
drop policy if exists "Anonymous insert allowed" on public.analytics_events;
create policy "Anonymous insert allowed"
  on public.analytics_events for insert
  with check (user_id is null);

-- Reading analytics is admin-only. The service role used by /api/admin/* routes
-- bypasses RLS entirely, so no SELECT policy is needed for those flows.
-- This explicit absence of a SELECT policy means row-level reads via the
-- public anon/authenticated key return zero rows — which is the goal.

comment on table public.analytics_events is
  'Append-only event log for MjolnirUI activity analytics. Read via service-role only.';
comment on column public.analytics_events.event_type is
  'Discriminator for the payload shape. See app/lib/analytics.ts for canonical types.';
comment on column public.analytics_events.payload is
  'Event-specific data. Common keys: tool, component_id, page, asset_type.';
