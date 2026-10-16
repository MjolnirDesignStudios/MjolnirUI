"use client";

// Asgardians dashboard — associate pipeline overview + entry points to the tools.
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ResumeSummary = { id: string; ats_score: number | null; status: string; iterations: number };
type Associate = {
  id: string;
  full_name: string;
  email: string | null;
  location: string | null;
  status: string;
  created_at: string;
  asgardians_resumes: ResumeSummary[];
};

const PIPELINE: { key: string; label: string; accent: string }[] = [
  { key: "applicant", label: "Applicants", accent: "border-zinc-500" },
  { key: "screening", label: "Screening", accent: "border-cyan-500" },
  { key: "enhanced", label: "Enhanced", accent: "border-emerald-500" },
  { key: "onboarded", label: "Onboarded", accent: "border-purple-500" },
  { key: "asgardian", label: "Asgardians", accent: "border-amber-500" },
];

const NEXT_STATUS: Record<string, string> = {
  applicant: "screening",
  screening: "enhanced",
  enhanced: "onboarded",
  onboarded: "asgardian",
};

export default function AsgardiansDashboard() {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/asgardians/associates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed to load");
      setAssociates(data.associates ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load associates");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function advance(associate: Associate) {
    const next = NEXT_STATUS[associate.status];
    if (!next) return;
    const res = await fetch("/api/asgardians/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ associateId: associate.id, status: next }),
    });
    if (res.ok) {
      toast.success(`${associate.full_name} → ${next}`);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to update status");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-white via-amber-300 to-orange-400 bg-clip-text text-transparent">
          ⚡ Asgardians
        </h1>
        <p className="text-xl text-gray-300">
          Associate Management — resume enhancement, job screening, and onboarding.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <a
          href="/admin/asgardians/resume-forge"
          className="px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-black font-bold hover:opacity-90 transition"
        >
          🔨 Resume Forge
        </a>
        <a
          href="/admin/asgardians/job-screening"
          className="px-6 py-3 rounded-xl border border-cyan-500/50 text-cyan-300 font-bold hover:bg-cyan-500/10 transition"
        >
          🔍 Job Screening
        </a>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading associates…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {PIPELINE.map((stage) => {
            const group = associates.filter((a) => a.status === stage.key);
            return (
              <div key={stage.key} className={`rounded-xl border-t-2 ${stage.accent} bg-zinc-900/60 p-4`}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-gray-300">{stage.label}</h2>
                  <span className="text-2xl font-black text-white">{group.length}</span>
                </div>
                <div className="space-y-3">
                  {group.map((a) => {
                    const latest = a.asgardians_resumes?.[a.asgardians_resumes.length - 1];
                    return (
                      <div key={a.id} className="rounded-lg bg-black/50 border border-zinc-800 p-3">
                        <p className="font-semibold text-white text-sm">{a.full_name}</p>
                        {a.location && <p className="text-xs text-gray-500">{a.location}</p>}
                        {latest?.ats_score != null && (
                          <p className="text-xs mt-1">
                            <span className="text-gray-400">ATS </span>
                            <span className={latest.ats_score >= 88 ? "text-emerald-400" : "text-amber-400"}>
                              {latest.ats_score}
                            </span>
                          </p>
                        )}
                        {NEXT_STATUS[a.status] && (
                          <button
                            onClick={() => advance(a)}
                            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Advance → {NEXT_STATUS[a.status]}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {group.length === 0 && <p className="text-xs text-gray-600">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
