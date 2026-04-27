// app/lib/designAssets.ts
// CRUD helpers + tier-limit enforcement for the Foundations pages.
// Asset shapes are typed here so the rest of the app gets compile-time safety
// over what's stored in the user_design_assets.config jsonb column.

import { supabaseAuthAdmin } from "@/lib/supabaseAdmin";
import { TIER_CONFIG, type TierName } from "@/lib/tierConfig";

/* ═══════════════════════════════════════════════════════
   ASSET TYPE CONTRACTS
   These shapes define what goes in the `config` jsonb column,
   discriminated by `asset_type`.
   ═══════════════════════════════════════════════════════ */

export type AssetType = "color_palette" | "type_system" | "token_set" | "icon";

export interface ColorPaletteConfig {
  /** Brand seed color (hex) used to derive the rest */
  seed: string;
  /** Mode this palette is designed for */
  mode: "dark" | "light";
  /** Full ramp 50/100/200/.../900 */
  ramp: Record<"50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900", string>;
  /** Semantic colors — required for token export */
  semantic?: {
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
}

export interface TypeSystemConfig {
  /** Display font family (heading) */
  display: string;
  /** Body font family */
  body: string;
  /** Optional monospace font family */
  mono?: string;
  /** Modular scale ratio used to compute step sizes */
  ratio: 1.2 | 1.25 | 1.333 | 1.5 | 1.618;
  /** Base font size in px (typically 16) */
  basePx: number;
  /** Default line-height for body */
  lineHeight: number;
  /** Default letter-spacing in em */
  letterSpacing: number;
}

export interface TokenSetConfig {
  /** Reference to a saved color_palette id */
  colorPaletteId?: string;
  /** Reference to a saved type_system id */
  typeSystemId?: string;
  /** Theme mode this set targets */
  themeMode: "asgard-dark" | "asgard-light" | "custom";
  /** Spacing scale (e.g. tailwind-style 0/0.5/1/2/4/8…) */
  spacing?: Record<string, string>;
  /** Border radii */
  radii?: Record<"sm" | "md" | "lg" | "xl" | "2xl" | "full", string>;
  /** Box shadows */
  shadows?: Record<"sm" | "md" | "lg" | "xl", string>;
}

export interface IconConfig {
  /** Generated SVG markup */
  svg: string;
  /** Composition recipe — shapes the user assembled */
  shapes: Array<{
    type: "circle" | "square" | "polygon" | "line" | "path" | "star";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    rotation?: number;
    /** Shape-specific params (e.g. polygon sides, star points) */
    params?: Record<string, number | string>;
  }>;
}

export type AssetConfig =
  | { asset_type: "color_palette"; config: ColorPaletteConfig }
  | { asset_type: "type_system"; config: TypeSystemConfig }
  | { asset_type: "token_set"; config: TokenSetConfig }
  | { asset_type: "icon"; config: IconConfig };

export interface DesignAsset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  name: string;
  config: ColorPaletteConfig | TypeSystemConfig | TokenSetConfig | IconConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/* ═══════════════════════════════════════════════════════
   TIER LIMITS — change here to update product behavior
   ═══════════════════════════════════════════════════════ */

const TIER_SAVE_LIMITS: Record<TierName, Record<AssetType, number>> = {
  free: { color_palette: 0, type_system: 0, token_set: 0, icon: 0 },
  base: { color_palette: 3, type_system: 3, token_set: 3, icon: 5 },
  pro: { color_palette: 10, type_system: 10, token_set: 10, icon: 25 },
  elite: {
    color_palette: Infinity,
    type_system: Infinity,
    token_set: Infinity,
    icon: Infinity,
  },
};

export function getSaveLimit(tier: TierName, assetType: AssetType): number {
  return TIER_SAVE_LIMITS[tier]?.[assetType] ?? 0;
}

export function canSaveMore(
  tier: TierName,
  assetType: AssetType,
  currentCount: number
): boolean {
  return currentCount < getSaveLimit(tier, assetType);
}

/* ═══════════════════════════════════════════════════════
   CRUD — server-only helpers (call from API routes)
   ═══════════════════════════════════════════════════════ */

export async function listAssets(
  userId: string,
  assetType?: AssetType
): Promise<DesignAsset[]> {
  let query = supabaseAuthAdmin
    .from("user_design_assets")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (assetType) query = query.eq("asset_type", assetType);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as DesignAsset[];
}

export async function getAsset(
  userId: string,
  id: string
): Promise<DesignAsset | null> {
  const { data, error } = await supabaseAuthAdmin
    .from("user_design_assets")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data || null) as DesignAsset | null;
}

export async function createAsset(args: {
  userId: string;
  tier: TierName;
  assetType: AssetType;
  name: string;
  config: ColorPaletteConfig | TypeSystemConfig | TokenSetConfig | IconConfig;
  isDefault?: boolean;
}): Promise<{ data?: DesignAsset; error?: string }> {
  // Tier-limit check
  const existing = await listAssets(args.userId, args.assetType);
  if (!canSaveMore(args.tier, args.assetType, existing.length)) {
    const limit = getSaveLimit(args.tier, args.assetType);
    return {
      error: `Tier limit reached: ${TIER_CONFIG[args.tier].label} allows ${limit} saved ${args.assetType}(s). Upgrade to save more.`,
    };
  }

  const { data, error } = await supabaseAuthAdmin
    .from("user_design_assets")
    .insert({
      user_id: args.userId,
      asset_type: args.assetType,
      name: args.name,
      config: args.config,
      is_default: args.isDefault ?? false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as DesignAsset };
}

export async function updateAsset(args: {
  userId: string;
  id: string;
  patch: Partial<Pick<DesignAsset, "name" | "config" | "is_default">>;
}): Promise<{ data?: DesignAsset; error?: string }> {
  const { data, error } = await supabaseAuthAdmin
    .from("user_design_assets")
    .update(args.patch)
    .eq("id", args.id)
    .eq("user_id", args.userId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as DesignAsset };
}

export async function deleteAsset(args: {
  userId: string;
  id: string;
}): Promise<{ error?: string }> {
  const { error } = await supabaseAuthAdmin
    .from("user_design_assets")
    .delete()
    .eq("id", args.id)
    .eq("user_id", args.userId);
  if (error) return { error: error.message };
  return {};
}
