-- Migration: stripe_webhook_events table
-- Date: 2026-05-22
-- Purpose: Idempotency log for Stripe webhook events.
--
-- Why: Stripe retries failed webhook deliveries with exponential backoff. Without
-- a dedup mechanism the same event (e.g. checkout.session.completed) could
-- process twice — granting tier upgrades on stale events, double-firing
-- emails, or racing tier=free downgrades against a pending invoice retry.
--
-- Design notes:
--   - event_id is Stripe's unique evt_xxx identifier; primary key + unique
--     constraint means duplicate inserts fail cleanly with conflict.
--   - The webhook uses INSERT ... ON CONFLICT DO NOTHING RETURNING event_id
--     to atomically claim a new event in a single round-trip.
--   - 90-day retention is sufficient — Stripe stops retrying after 3 days.
--   - Service-role only (the webhook runs server-side with the service key).

create table if not exists public.stripe_webhook_events (
  event_id     text        primary key,
  event_type   text        not null,
  processed_at timestamptz not null default now(),
  -- Free-form scratch space for debugging / future audit (e.g. customer_id,
  -- subscription_id, error_message). Never indexed.
  meta         jsonb       not null default '{}'::jsonb
);

-- Retention: drop rows older than 90 days. Run via cron or manual prune.
create index if not exists idx_stripe_webhook_events_processed_at
  on public.stripe_webhook_events (processed_at);

-- ── Row Level Security ────────────────────────────────────
alter table public.stripe_webhook_events enable row level security;

-- No public read/write policies. The webhook uses the service-role key which
-- bypasses RLS. Locking the table down to service-role only means a leaked
-- anon/authenticated key cannot tamper with the idempotency log.

comment on table public.stripe_webhook_events is
  'Idempotency log for processed Stripe webhook events. Service-role only.';
comment on column public.stripe_webhook_events.event_id is
  'Stripe event ID (evt_xxx). Unique — duplicates indicate a retry.';
comment on column public.stripe_webhook_events.event_type is
  'Stripe event type for diagnostics (e.g. checkout.session.completed).';
