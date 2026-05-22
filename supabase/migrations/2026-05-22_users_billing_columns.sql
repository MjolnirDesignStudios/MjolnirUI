-- Migration: lock next_auth.users billing schema
-- Date: 2026-05-22
-- Purpose: Version-control the custom columns the NextAuth Supabase Adapter
-- table picked up over time. The adapter created next_auth.users with
-- name/email/emailVerified/image/id, and our app + webhook code has been
-- writing tier / role / stripe_customer_id / stripe_subscription_id /
-- created_at / updated_at on top of that. Until now those custom additions
-- were untracked — a fresh Supabase project (or a restored backup) would
-- not have them and the webhook would silently fail.
--
-- This migration is idempotent:
--   - IF NOT EXISTS guards on every ADD COLUMN
--   - DROP CONSTRAINT IF EXISTS before re-adding check constraints
--   - UPDATE statements null-fill before flipping columns to NOT NULL
--
-- Design notes:
--   - Tier check constraint mirrors app/lib/tierConfig.ts (free|base|pro|elite).
--   - Role check constraint mirrors app/lib/adminUtils.ts (user|admin).
--   - Index on stripe_customer_id makes webhook lookups O(1) — both
--     subscription.updated and subscription.deleted query by customer_id.
--
-- NOTE: A parallel public.users table also exists with similar columns. It is
-- NOT the table NextAuth or the webhook write to. That duplicate table is a
-- legacy artifact and should be audited / dropped in a post-launch cleanup
-- (do NOT drop pre-launch — needs dependency check first).

-- ── Columns ──────────────────────────────────────────────
-- Most are already present in production; the IF NOT EXISTS guards make
-- this safe to re-run on any environment.

alter table next_auth.users
  add column if not exists tier text default 'free',
  add column if not exists role text default 'user',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- ── Backfill null values before tightening constraints ───
update next_auth.users set tier = 'free'    where tier is null;
update next_auth.users set role = 'user'    where role is null;
update next_auth.users set created_at = now() where created_at is null;
update next_auth.users set updated_at = now() where updated_at is null;

-- ── NOT NULL + defaults ──────────────────────────────────
alter table next_auth.users
  alter column tier       set not null,
  alter column tier       set default 'free',
  alter column role       set not null,
  alter column role       set default 'user',
  alter column created_at set not null,
  alter column created_at set default now(),
  alter column updated_at set not null,
  alter column updated_at set default now();

-- ── Tier check constraint ────────────────────────────────
alter table next_auth.users drop constraint if exists users_tier_check;
alter table next_auth.users
  add constraint users_tier_check
  check (tier in ('free', 'base', 'pro', 'elite'));

-- ── Role check constraint ────────────────────────────────
alter table next_auth.users drop constraint if exists users_role_check;
alter table next_auth.users
  add constraint users_role_check
  check (role in ('user', 'admin'));

-- ── Webhook lookup index ─────────────────────────────────
-- subscription.updated / subscription.deleted / invoice.payment_failed all
-- look up the user row by stripe_customer_id — without this index those
-- writes are sequential scans (fine at 7 users, painful at 7,000).
create index if not exists idx_users_stripe_customer
  on next_auth.users (stripe_customer_id)
  where stripe_customer_id is not null;

-- ── Documentation ────────────────────────────────────────
comment on table next_auth.users is
  'Canonical user table — managed by NextAuth SupabaseAdapter. Custom columns (tier, role, stripe_customer_id, stripe_subscription_id, created_at, updated_at) added by MjolnirUI billing. See app/lib/nextAuthOptions.ts and app/api/webhooks/stripe/route.ts.';

comment on column next_auth.users.tier is
  'Subscription tier. Updated by /api/webhooks/stripe on checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, and invoice.payment_failed.';

comment on column next_auth.users.role is
  'App role. user = default; admin = elevated capability for /admin/* surfaces and admin-only sidebar sections.';

comment on column next_auth.users.stripe_customer_id is
  'Stripe customer reference. Set on first successful checkout. Reused across re-checkouts to prevent duplicate customers.';

comment on column next_auth.users.stripe_subscription_id is
  'Stripe subscription reference. Cleared on customer.subscription.deleted. Used by the /api/stripe/portal route to open a billing portal session.';
