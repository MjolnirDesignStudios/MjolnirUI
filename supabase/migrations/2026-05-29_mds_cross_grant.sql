-- Migration: MDS cross-grant tracking
-- Date: 2026-05-29
-- Purpose: Mark users whose MjolnirUI tier was granted via an MDS
-- subscription. Lets us:
--   - Distinguish "paid MjolnirUI subscriber" from "MDS comp"
--   - Revoke comp tier when the MDS subscription ends
--   - Preserve lifetime grants (Bitcoin Founders)
--
-- Columns:
--   mds_grant            — boolean, true when tier comes from MDS
--   mds_product_id       — Stripe product ID of the source MDS subscription
--   mds_subscription_id  — Stripe subscription ID; null for lifetime grants
--   mds_granted_at       — ISO timestamp the grant landed

alter table next_auth.users
  add column if not exists mds_grant boolean not null default false,
  add column if not exists mds_product_id text,
  add column if not exists mds_subscription_id text,
  add column if not exists mds_granted_at timestamptz;

-- Index for revoke lookups (fired when MDS subscription is cancelled).
create index if not exists idx_users_mds_subscription
  on next_auth.users (mds_subscription_id)
  where mds_subscription_id is not null;

comment on column next_auth.users.mds_grant is
  'TRUE when this user''s tier was granted via an MDS subscription (not a direct MjolnirUI purchase).';
comment on column next_auth.users.mds_product_id is
  'Stripe product ID of the MDS subscription that granted this tier.';
comment on column next_auth.users.mds_subscription_id is
  'Stripe subscription ID. Null for lifetime grants (e.g. Bitcoin Founders).';
comment on column next_auth.users.mds_granted_at is
  'When the cross-grant was applied. Useful for audits / refund timing.';
