// POST /api/asgardians/resumes/analyze
// Multipart upload (file) -> extract structured resume data + ATS analysis,
// store the source file + rows in Supabase, return everything to the client.
import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/asgardians/auth";
import { analyzeResumeFile } from "@/lib/asgardians/pipeline";
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/asgardians/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ACCEPTED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const mediaType = file.type || "application/pdf";
  if (!ACCEPTED.has(mediaType)) {
    return NextResponse.json({ error: `unsupported file type: ${mediaType}` }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { extracted, analysis } = await analyzeResumeFile(bytes, mediaType);

  // Persist: upsert associate by email (fall back to new row), store file + resume row.
  const db = supabaseAdmin();
  const email = extracted.contact.email ?? null;
  let associate = null;
  if (email) {
    const { data } = await db
      .from("asgardians_associates")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();
    associate = data;
  }
  if (!associate) {
    const { data, error } = await db
      .from("asgardians_associates")
      .insert({
        full_name: extracted.contact.fullName,
        email,
        phone: extracted.contact.phone ?? null,
        location: extracted.contact.location ?? null,
        status: "screening",
        credentials: { targetRoles: analysis.targetRoles, skills: extracted.skills },
      })
      .select("id, status")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    associate = data;
  }

  const filePath = `${associate.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const { error: uploadError } = await db.storage
    .from(RESUME_BUCKET)
    .upload(filePath, bytes, { contentType: mediaType });
  if (uploadError) console.error("resume upload failed:", uploadError.message);

  const { data: resumeRow, error: resumeError } = await db
    .from("asgardians_resumes")
    .insert({
      associate_id: associate.id,
      source_file_path: uploadError ? null : filePath,
      extracted,
      analysis,
      ats_score: Math.round(analysis.overallScore),
      status: "analyzed",
    })
    .select("id")
    .single();
  if (resumeError) return NextResponse.json({ error: resumeError.message }, { status: 500 });

  return NextResponse.json({
    associateId: associate.id,
    resumeId: resumeRow.id,
    extracted,
    analysis,
  });
}
