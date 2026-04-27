// app/api/design-assets/[id]/route.ts
// GET    /api/design-assets/:id   — fetch one asset by id (must belong to current user)
// PATCH  /api/design-assets/:id   — update name / config / is_default
// DELETE /api/design-assets/:id   — delete an asset
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextAuthOptions";
import { getAsset, updateAsset, deleteAsset } from "@/lib/designAssets";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  try {
    const asset = await getAsset(session.user.id, id);
    if (!asset) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ asset });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: { name?: string; config?: object; is_default?: boolean } = {};
  if (typeof body.name === "string") {
    if (body.name.length > 100) {
      return NextResponse.json({ error: "name max 100 chars" }, { status: 400 });
    }
    patch.name = body.name;
  }
  if (body.config && typeof body.config === "object") {
    patch.config = body.config;
  }
  if (typeof body.is_default === "boolean") {
    patch.is_default = body.is_default;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update (name, config, is_default)" },
      { status: 400 }
    );
  }

  const result = await updateAsset({ userId: session.user.id, id, patch });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  if (!result.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ asset: result.data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const result = await deleteAsset({ userId: session.user.id, id });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
