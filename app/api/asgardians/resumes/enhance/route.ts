// POST /api/asgardians/resumes/enhance
// Takes extracted resume data + analysis and runs the enhance -> evaluate
// iterative self-improvement loop until the evaluator passes (or 3 rounds).
import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/asgardians/auth";
import { enhanceResume } from "@/lib/asgardians/pipeline";
import { supabaseAdmin } from "@/lib/asgardians/db";
import type { ResumeAnalysis, ResumeData } from "@/lib/asgardians/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: {
    resumeId?: string;
    extracted?: ResumeData;
    analysis?: ResumeAnalysis;
    targetRole?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.extracted) {
    return NextResponse.json({ error: "extracted resume data is required" }, { status: 400 });
  }

  const { enhancement, evaluation, iterations } = await enhanceResume(
    body.extracted,
    body.analysis,
    body.targetRole,
  );

  if (body.resumeId) {
    const db = supabaseAdmin();
    await db
      .from("asgardians_resumes")
      .update({
        enhanced: enhancement,
        evaluation,
        ats_score: Math.round(evaluation.atsScore),
        iterations,
        status: "evaluated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.resumeId);
  }

  return NextResponse.json({ enhancement, evaluation, iterations });
}
