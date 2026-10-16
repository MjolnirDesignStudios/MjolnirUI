// POST /api/asgardians/resumes/export
// Renders enhanced resume data to docx / pdf / txt and streams it back.
import { NextRequest, NextResponse } from "next/server";
import { requireWrite } from "@/lib/asgardians/auth";
import { supabaseAdmin } from "@/lib/asgardians/db";
import { toDocx, toPdf, toTxt } from "@/lib/asgardians/exporters";
import { resumeDataSchema } from "@/lib/asgardians/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = {
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  pdf: { ext: "pdf", mime: "application/pdf" },
  txt: { ext: "txt", mime: "text/plain" },
} as const;

export async function POST(request: NextRequest) {
  const guard = await requireWrite();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: { resume?: unknown; format?: string; resumeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const format = FORMATS[body.format as keyof typeof FORMATS];
  if (!format) {
    return NextResponse.json({ error: "format must be docx, pdf, or txt" }, { status: 400 });
  }
  const parsed = resumeDataSchema.safeParse(body.resume);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid resume data" }, { status: 400 });
  }
  const resume = parsed.data;

  let payload: Uint8Array;
  if (body.format === "docx") payload = new Uint8Array(await toDocx(resume));
  else if (body.format === "pdf") payload = await toPdf(resume);
  else payload = new TextEncoder().encode(toTxt(resume));

  if (body.resumeId) {
    const db = supabaseAdmin();
    await db
      .from("asgardians_resumes")
      .update({ status: "exported", updated_at: new Date().toISOString() })
      .eq("id", body.resumeId);
  }

  const safeName = resume.contact.fullName.replace(/[^\w]+/g, "-");
  return new NextResponse(Buffer.from(payload), {
    headers: {
      "Content-Type": format.mime,
      "Content-Disposition": `attachment; filename="${safeName}-Resume.${format.ext}"`,
    },
  });
}
