-- Migration: free-tier trial unlock columns
-- Date: 2026-05-22
-- Purpose: Track Free-tier users' usage of the 5-component Base-tier trial.
-- Storage is hybrid — localStorage is the source of truth for gating logic
-- (instant UX, no DB round-trip on every component view), but we also
-- best-effort sync to these columns so the admin dashboard can see real
-- conversion-funnel data ("how many users hit the 5-cap before upgrading").
--
-- Columns:
--   free_unlocks_count   — number of unique Base-tier components the user
--                          has unlocked via trial. Hard cap of 5 enforced
--                          in the API + hook, not in the DB constraint
--                          (we may raise the cap without a migration).
--   free_unlocks_ids     — the actual component IDs unlocked. Append-only
--                          set semantics: API guards against duplicates so
--                          re-views don't double-count.
--
-- Idempotent. Safe to re-run.

alter table next_auth.users
  add column if not exists free_unlocks_count int  not null default 0,
  add column if not exists free_unlocks_ids   text[] not null default '{}';

-- Document the columns for future devs reading the schema cold.
comment on column next_auth.users.free_unlocks_count is
  'Number of unique Base-tier components a Free-tier user has unlocked via the 5-component trial. Incremented by /api/free-unlocks/track when a previously-unseen componentId is recorded.';

comment on column next_auth.users.free_unlocks_ids is
  'Set of componentIds the user has unlocked via the Free-tier trial. Append-only — API uses array_position to detect duplicates before writing.';
