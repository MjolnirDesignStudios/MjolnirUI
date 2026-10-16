// CLI harness for the Asgardians resume pipeline. Runs the exact engine the
// admin portal uses (lib/asgardians/pipeline + exporters) against a local file.
//
//   npx tsx scripts/asgardians-run.ts "<resume.pdf>" "<output-dir>" [target role]
//
// Requires ANTHROPIC_API_KEY in the environment and Supabase creds in .env.local.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { analyzeResumeFile, enhanceResume } from "../app/lib/asgardians/pipeline";
import { toDocx, toPdf, toTxt } from "../app/lib/asgardians/exporters";
import { supabaseAdmin, RESUME_BUCKET } from "../app/lib/asgardians/db";

// Minimal .env.local loader (no dotenv dependency).
function loadEnvLocal(): void {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnvLocal();
  const [, , inputPath, outDir, targetRole] = process.argv;
  if (!inputPath || !outDir) {
    console.error('Usage: npx tsx scripts/asgardians-run.ts "<resume.pdf>" "<output-dir>" [target role]');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }

  const bytes = new Uint8Array(readFileSync(inputPath));
  const ext = inputPath.toLowerCase().split(".").pop();
  const mediaType =
    ext === "pdf"
      ? "application/pdf"
      : ext === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "text/plain";

  console.log(`\n⚡ ASGARDIANS RESUME FORGE — ${basename(inputPath)}\n`);

  console.log("→ [1/4] Analyzing (extraction + ATS intake analysis)…");
  const { extracted, analysis } = await analyzeResumeFile(bytes, mediaType);
  console.log(`   Candidate: ${extracted.contact.fullName}`);
  console.log(`   Current ATS score: ${Math.round(analysis.overallScore)}/100`);
  console.log(`   Target roles: ${analysis.targetRoles.join(", ")}`);
  console.log(`   Keyword gaps: ${analysis.keywordGaps.join(", ")}`);

  console.log("\n→ [2/4] Enhancing (iterative self-improvement loop)…");
  const { enhancement, evaluation, iterations } = await enhanceResume(
    extracted,
    analysis,
    targetRole,
    (i, ev) =>
      console.log(
        `   Iteration ${i}: ATS ${Math.round(ev.atsScore)} | 2-page fit: ${ev.fitsTwoPages} | truthful: ${ev.truthful} | passes: ${ev.passes}`,
      ),
  );

  console.log(`\n→ [3/4] Exporting to ${outDir}`);
  mkdirSync(outDir, { recursive: true });
  const safeName = enhancement.resume.contact.fullName.replace(/[^\w]+/g, "-");
  const docx = await toDocx(enhancement.resume);
  const pdf = await toPdf(enhancement.resume);
  const txt = toTxt(enhancement.resume);
  const outputs = [
    { file: join(outDir, `${safeName}-Resume.docx`), data: docx as Uint8Array },
    { file: join(outDir, `${safeName}-Resume.pdf`), data: pdf },
    { file: join(outDir, `${safeName}-Resume.txt`), data: new TextEncoder().encode(txt) },
  ];
  for (const o of outputs) {
    writeFileSync(o.file, o.data);
    console.log(`   ✓ ${o.file}`);
  }
  const runArtifact = join(outDir, `${safeName}-Run.json`);
  writeFileSync(
    runArtifact,
    JSON.stringify({ extracted, analysis, enhancement, evaluation, iterations }, null, 2),
  );
  console.log(`   ✓ ${runArtifact}`);

  console.log("\n→ [4/4] Persisting to Supabase (associate + resume rows)…");
  try {
    const db = supabaseAdmin();
    const email = extracted.contact.email ?? null;
    let associateId: string | null = null;
    if (email) {
      const { data } = await db
        .from("asgardians_associates")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      associateId = data?.id ?? null;
    }
    if (!associateId) {
      const { data, error } = await db
        .from("asgardians_associates")
        .insert({
          full_name: extracted.contact.fullName,
          email,
          phone: extracted.contact.phone ?? null,
          location: extracted.contact.location ?? null,
          status: "enhanced",
          credentials: { targetRoles: analysis.targetRoles, skills: extracted.skills },
        })
        .select("id")
        .single();
      if (error) throw error;
      associateId = data.id;
    }
    const storagePath = `${associateId}/${basename(inputPath).replace(/[^\w.-]+/g, "_")}`;
    await db.storage.from(RESUME_BUCKET).upload(storagePath, bytes, {
      contentType: mediaType,
      upsert: true,
    });
    const { error: resumeError } = await db.from("asgardians_resumes").insert({
      associate_id: associateId,
      source_file_path: storagePath,
      extracted,
      analysis,
      enhanced: enhancement,
      evaluation,
      ats_score: Math.round(evaluation.atsScore),
      iterations,
      status: "exported",
    });
    if (resumeError) throw resumeError;
    console.log(`   ✓ Associate ${associateId} recorded`);
  } catch (e) {
    console.error(`   ✗ Supabase persist failed: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
  }

  console.log("\n══════════════════════════════════════════");
  console.log(`  ATS score: ${Math.round(analysis.overallScore)} → ${Math.round(evaluation.atsScore)} (${iterations} iteration${iterations > 1 ? "s" : ""})`);
  console.log(`  Keywords added: ${enhancement.keywordsAdded.join(", ")}`);
  console.log("  Changes:");
  for (const c of enhancement.changeLog) console.log(`   • ${c}`);
  console.log("══════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
