// app/api/design-assets/route.ts
// GET  /api/design-assets             — list current user's saved assets (optional ?type= filter)
// POST /api/design-assets             — create a new asset, tier-limit enforced
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import {
  listAssets,
  createAsset,
  type AssetType,
} from "@/lib/designAssets";
import type { TierName } from "@/lib/tierConfig";

const VALID_TYPES: AssetType[] = ["color_palette", "type_system", "token_set", "icon"];

export async function GET(req: Request) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type");
  const assetType =
    typeParam && VALID_TYPES.includes(typeParam as AssetType)
      ? (typeParam as AssetType)
      : undefined;

  try {
    const assets = await listAssets(session.user.id, assetType);
    return NextResponse.json({ assets });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to list assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = (session.user.tier as TierName) || "free";

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { asset_type, name, config, is_default } = body || {};
  if (!asset_type || !VALID_TYPES.includes(asset_type)) {
    return NextResponse.json(
      { error: "asset_type must be one of: " + VALID_TYPES.join(", ") },
      { status: 400 }
    );
  }
  if (!name || typeof name !== "string" || name.length > 100) {
    return NextResponse.json(
      { error: "name is required (string, max 100 chars)" },
      { status: 400 }
    );
  }
  if (!config || typeof config !== "object") {
    return NextResponse.json({ error: "config object is required" }, { status: 400 });
  }

  const result = await createAsset({
    userId: session.user.id,
    tier,
    assetType: asset_type,
    name,
    config,
    isDefault: !!is_default,
  });

  if (result.error) {
    // Tier-limit errors → 403 so the UI can show the upgrade modal
    const status = result.error.startsWith("Tier limit") ? 403 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ asset: result.data }, { status: 201 });
}
