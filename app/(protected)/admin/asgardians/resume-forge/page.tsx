"use client";

// Resume Forge — upload → analyze → enhance (iterative loop) → evaluate → export.
import { useRef, useState } from "react";
import { toast } from "sonner";
import type {
  Enhancement,
  Evaluation,
  ResumeAnalysis,
  ResumeData,
} from "@/lib/asgardians/types";

type Stage = "idle" | "analyzing" | "analyzed" | "enhancing" | "done";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 88 ? "text-emerald-400 border-emerald-500/50" : score >= 70 ? "text-amber-400 border-amber-500/50" : "text-red-400 border-red-500/50";
  return (
    <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${color} text-2xl font-black`}>
      {Math.round(score)}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
      <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function ResumeForge() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [targetRole, setTargetRole] = useState("");
  const [ids, setIds] = useState<{ associateId?: string; resumeId?: string }>({});
  const [extracted, setExtracted] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [iterations, setIterations] = useState(0);
  const [exporting, setExporting] = useState<string | null>(null);

  async function analyze() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a resume file first (PDF, DOCX, or TXT).");
      return;
    }
    setStage("analyzing");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/asgardians/resumes/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "analyze failed");
      setIds({ associateId: data.associateId, resumeId: data.resumeId });
      setExtracted(data.extracted);
      setAnalysis(data.analysis);
      setStage("analyzed");
      toast.success(`Analyzed — current ATS score ${Math.round(data.analysis.overallScore)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyze failed");
      setStage("idle");
    }
  }

  async function enhance() {
    if (!extracted) return;
    setStage("enhancing");
    try {
      const res = await fetch("/api/asgardians/resumes/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: ids.resumeId,
          extracted,
          analysis,
          targetRole: targetRole || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "enhance failed");
      setEnhancement(data.enhancement);
      setEvaluation(data.evaluation);
      setIterations(data.iterations);
      setStage("done");
      toast.success(`Enhanced in ${data.iterations} iteration${data.iterations > 1 ? "s" : ""} — ATS ${Math.round(data.evaluation.atsScore)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enhance failed");
      setStage("analyzed");
    }
  }

  async function exportAs(format: "docx" | "pdf" | "txt") {
    if (!enhancement) return;
    setExporting(format);
    try {
      const res = await fetch("/api/asgardians/resumes/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: enhancement.resume, format, resumeId: ids.resumeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${enhancement.resume.contact.fullName.replace(/[^\w]+/g, "-")}-Resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  const busy = stage === "analyzing" || stage === "enhancing";

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-linear-to-r from-white via-amber-300 to-orange-400 bg-clip-text text-transparent">
          🔨 Resume Forge
        </h1>
        <p className="text-lg text-gray-300">
          Upload → Analyze → Enhance with ATS-optimized keywords → Evaluate → Export (2-page format).
        </p>
      </div>

      <Section title="1 · Upload & Analyze">
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="text-sm text-gray-300 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white file:cursor-pointer"
          />
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role (optional)"
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white placeholder-gray-600 focus:border-amber-500 outline-none"
          />
          <button
            onClick={analyze}
            disabled={busy}
            className="px-6 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-emerald-500 text-black font-bold disabled:opacity-50"
          >
            {stage === "analyzing" ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </Section>

      {analysis && extracted && (
        <Section title="2 · Intake Analysis">
          <div className="flex flex-wrap gap-8 items-start">
            <div className="text-center">
              <ScoreBadge score={analysis.overallScore} />
              <p className="text-xs text-gray-500 mt-2">Current ATS</p>
            </div>
            <div className="flex-1 min-w-64 grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-emerald-400 font-semibold mb-1">Strengths</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-amber-400 font-semibold mb-1">Issues & Keyword Gaps</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {[...analysis.weaknesses, ...analysis.atsIssues].map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <p className="text-gray-400 mt-2">
                  Missing keywords: <span className="text-cyan-300">{analysis.keywordGaps.join(", ")}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={enhance}
              disabled={busy}
              className="px-6 py-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-black font-bold disabled:opacity-50"
            >
              {stage === "enhancing" ? "Forging… (iterative enhancement loop)" : "⚡ Enhance Resume"}
            </button>
          </div>
        </Section>
      )}

      {enhancement && evaluation && (
        <>
          <Section title="3 · Enhancement Result">
            <div className="flex flex-wrap gap-8 items-start">
              <div className="text-center">
                <ScoreBadge score={evaluation.atsScore} />
                <p className="text-xs text-gray-500 mt-2">
                  New ATS · {iterations} pass{iterations > 1 ? "es" : ""}
                </p>
                <p className={`text-xs mt-1 ${evaluation.fitsTwoPages ? "text-emerald-400" : "text-red-400"}`}>
                  {evaluation.fitsTwoPages ? "✓ Fits 2 pages" : "✗ Over 2 pages"}
                </p>
              </div>
              <div className="flex-1 min-w-64 text-sm">
                <p className="text-cyan-300 font-semibold mb-1">Keywords added</p>
                <p className="text-gray-300 mb-3">{enhancement.keywordsAdded.join(", ")}</p>
                <p className="text-cyan-300 font-semibold mb-1">Change log</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {enhancement.changeLog.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="4 · Export">
            <div className="flex flex-wrap gap-3">
              {(["docx", "pdf", "txt"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => exportAs(f)}
                  disabled={exporting !== null}
                  className="px-6 py-2 rounded-lg border border-emerald-500/50 text-emerald-300 font-bold hover:bg-emerald-500/10 transition disabled:opacity-50"
                >
                  {exporting === f ? "Exporting…" : `⬇ ${f.toUpperCase()}`}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Enhanced Resume Preview">
            <div className="text-sm text-gray-300 space-y-4">
              <div>
                <p className="text-white font-bold text-lg">{enhancement.resume.contact.fullName}</p>
                {enhancement.resume.contact.headline && (
                  <p className="text-amber-300">{enhancement.resume.contact.headline}</p>
                )}
              </div>
              <p className="italic text-gray-400">{enhancement.resume.summary}</p>
              {enhancement.resume.experience.map((job, i) => (
                <div key={i}>
                  <p className="text-white font-semibold">
                    {job.title}
                    {job.company ? ` — ${job.company}` : ""}{" "}
                    <span className="text-gray-500 font-normal">
                      {job.startDate} – {job.endDate ?? "Present"}
                    </span>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
              <p>
                <span className="text-white font-semibold">Skills: </span>
                {enhancement.resume.skills.join(" • ")}
              </p>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
