// app/lib/mdsEntitlements.ts
// Cross-product entitlement mapping — Mjolnir Design Studios subscribers
// receive complimentary MjolnirUI access proportional to their MDS tier.
//
// Both MDS and MjolnirUI live on the same Stripe account
// (acct_1SKQknFxkFUD7EnZ), so a single webhook can see events for either
// product family. When the MjolnirUI webhook handler detects a product
// ID in MDS_PRODUCT_TIER_MAP, it cross-grants the mapped MjolnirUI tier
// to the customer's email — pre-creating a next_auth.users row if the
// user hasn't signed up for MjolnirUI yet.
//
// Once they sign in at mjolnirui.com (Google / GitHub / email), NextAuth's
// SupabaseAdapter finds the pre-created row by email and links the OAuth
// account. They get instant access — no discount codes, no manual flow.
//
// Mapping decided 2026-05-29:
//   MDS Base    → MjolnirUI Pro
//   MDS Pro     → MjolnirUI Pro
//   MDS Elite   → MjolnirUI Elite
//   MDS Bitcoin → MjolnirUI Elite (lifetime — never revoked, see below)

import type { TierName } from "./tierConfig";

/** MDS Stripe product ID → MjolnirUI tier grant. */
export const MDS_PRODUCT_TIER_MAP: Record<string, TierName> = {
  // "Mjolnir - Base" (canonical)
  prod_UQ3UrPXz3ORSzO: "pro",
  // "Mjolnir - Base" (older duplicate — same intent, same grant)
  prod_UDQapnburIxOY2: "pro",
  // "Mjolnir - Pro"
  prod_UDQg1QnJtaybo2: "pro",
  // "Mjolnir - Elite"
  prod_UDQrLjx3oD4WhT: "elite",
  // "Mjolnir - Bitcoin" — lifetime founding membership, treated as Elite
  prod_UDRRDtEJVdcyCM: "elite",
};

/** Product IDs whose grants are LIFETIME — never revoked on
 *  subscription.deleted. Bitcoin Founders paid a one-time fee for
 *  permanent access. */
export const MDS_LIFETIME_PRODUCTS = new Set<string>([
  "prod_UDRRDtEJVdcyCM", // Mjolnir - Bitcoin
]);

/** Returns the MjolnirUI tier to grant given an MDS product ID, or null
 *  if the product isn't part of the cross-grant program. */
export function getMdsGrantTier(productId: string): TierName | null {
  return MDS_PRODUCT_TIER_MAP[productId] ?? null;
}

/** Whether an MDS grant should survive subscription.deleted events. */
export function isMdsLifetimeGrant(productId: string): boolean {
  return MDS_LIFETIME_PRODUCTS.has(productId);
}

/** When an MDS subscription is revoked, downgrade users to this tier
 *  (unless they have a separate MjolnirUI subscription — caller checks
 *  for that case). Default is `free`. */
export const MDS_REVOKE_TIER: TierName = "free";
