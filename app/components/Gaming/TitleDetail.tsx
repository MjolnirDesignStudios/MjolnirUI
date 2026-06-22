"use client";

import { Play, Square, RotateCcw, RefreshCcwDot, CheckCircle2, ShieldAlert } from "lucide-react";
import type { GameView, GameReports } from "@/lib/gaming/types";
import { PHASES, phaseMeta } from "@/lib/gaming/agents";
import type { GateRow } from "./GamingStudio";

const SEV_STYLE: Record<string, string> = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-400 text-black",
  low: "bg-zinc-600 text-zinc-100",
};

function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

export function TitleDetail({
  games,
  selected,
  onSelect,
  reports,
  gates,
  onControl,
  onApproveGate,
}: {
  games: GameView[];
  selected: GameView | null;
  onSelect: (id: string) => void;
  reports: GameReports | null;
  gates: GateRow[];
  onControl: (action: string, game?: string, reason?: string) => void;
  onApproveGate: (phase: number, game_id?: string, notes?: string) => void;
}) {
  if (!selected) {
    return <p className="text-gray-500 text-sm">Select a title to inspect.</p>;
  }

  const currentPhase = selected.phase;
  const ph = phaseMeta(currentPhase);
  // Reports in the workspace are single-slot (the active run). Only show them
  // for the title the swarm most recently touched.
  const reportsMatch =
    reports &&
    (reports.sprint_plan?.game_id === selected.id ||
      reports.build_manifest?.game_id === selected.id ||
      reports.qa_report?.game_id === selected.id);

  const qa = reportsMatch ? reports?.qa_report : null;
  const build = reportsMatch ? reports?.build_manifest : null;
  const test = reportsMatch ? reports?.test_report : null;
  const sprint = reportsMatch ? reports?.sprint_plan : null;
  const bugs = qa?.bugs || [];

  const gateForCurrent = gates.find((g) => g.phase === currentPhase);
  const currentApproved = !!gateForCurrent?.gate;
  const prereqMissing = currentPhase
    ? PHASES.filter((p) => p.n < currentPhase && !gates.find((g) => g.phase === p.n)?.gate).map((p) => p.n)
    : [];

  return (
    <div className="space-y-6">
      {/* Title selector */}
      <div className="flex flex-wrap gap-2">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
              g.id === selected.id
                ? "border-purple-500 text-white bg-purple-500/10"
                : "border-zinc-800 text-gray-400 hover:text-white"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Phase pipeline */}
      <Panel title="Phase Pipeline">
        <div className="flex flex-wrap items-center gap-1.5">
          {PHASES.map((p, i) => {
            const approved = !!gates.find((g) => g.phase === p.n)?.gate;
            const isCurrent = p.n === currentPhase;
            return (
              <div key={p.n} className="flex items-center">
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] border ${
                    isCurrent
                      ? "border-purple-500 text-white bg-purple-500/15 font-bold"
                      : approved
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                      : "border-zinc-800 text-gray-500"
                  }`}
                >
                  {approved ? "✓ " : ""}
                  {p.n}. {p.name}
                </div>
                {i < PHASES.length - 1 && <span className="text-zinc-700 mx-0.5">→</span>}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current iteration */}
        <Panel
          title="Current Iteration"
          right={
            build?.web_export_ready ? (
              <span className="text-[11px] text-emerald-300">web export ready</span>
            ) : (
              <span className="text-[11px] text-gray-600">no web export</span>
            )
          }
        >
          {!reportsMatch ? (
            <p className="text-gray-500 text-sm">
              No active-run reports for {selected.name}. The workspace holds reports for the title the
              swarm most recently built.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {sprint?.sprint_goal && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Sprint goal</div>
                  <p className="text-gray-300">{sprint.sprint_goal}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Changed files" value={build?.changed_files?.length ?? 0} />
                <Stat
                  label="Coverage"
                  value={test?.coverage_summary?.overall_pct != null ? `${test.coverage_summary.overall_pct}%` : "—"}
                />
                <Stat label="Bugs" value={bugs.length} tone={bugs.length ? "warn" : "ok"} />
              </div>
              {build?.new_features?.length ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">New this pass</div>
                  <ul className="list-disc list-inside text-gray-400 space-y-0.5">
                    {build.new_features.slice(0, 6).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Panel>

        {/* Swarm control */}
        <Panel title="Swarm Control">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Status:</span>
              {selected.halted ? (
                <span className="text-red-300 font-semibold">⏹ HALTED</span>
              ) : (
                <span className="text-emerald-300 font-semibold">● ready</span>
              )}
              <span className="text-gray-600 ml-auto">{ph ? `Phase ${ph.n} · ${ph.name}` : ""}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CtrlBtn onClick={() => onControl("start", selected.id)} icon={Play} label="Start Run" tone="go" />
              {selected.halted ? (
                <CtrlBtn onClick={() => onControl("resume")} icon={RefreshCcwDot} label="Clear Halt" tone="go" />
              ) : (
                <CtrlBtn onClick={() => onControl("halt", selected.id)} icon={Square} label="Emergency Halt" tone="stop" />
              )}
              <CtrlBtn onClick={() => onControl("reset")} icon={RotateCcw} label="Reset Iteration" tone="neutral" />
            </div>
            <p className="text-[11px] text-gray-600">
              Start writes <code className="text-gray-500">run_request.json</code>; Halt writes{" "}
              <code className="text-gray-500">director_override.json</code>; Reset clears{" "}
              <code className="text-gray-500">patch_tasks.json</code>.
            </p>
          </div>
        </Panel>
      </div>

      {/* Bug tracker */}
      <Panel title="Bug Tracker" right={<span className="text-[11px] text-gray-600">{qa?.status || "—"}</span>}>
        {bugs.length === 0 ? (
          <p className="text-gray-500 text-sm">No bugs in the latest QA report. 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-zinc-800">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Sev</th>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {bugs.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 pr-3 font-mono text-xs text-gray-400">{b.id}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${SEV_STYLE[b.severity] || SEV_STYLE.low}`}>
                        {b.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-300">{b.description}</td>
                    <td className="py-2 pr-3 text-xs text-gray-500">{(b.file || "").split(/[\\/]/).pop()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Gate approval */}
      <Panel title={`Gate Approval${ph ? ` — Phase ${ph.n} (${ph.name})` : ""}`}>
        {!currentPhase ? (
          <p className="text-gray-500 text-sm">This title has no phase set in studio.json.</p>
        ) : currentApproved ? (
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">
              Phase {currentPhase} approved by {gateForCurrent?.gate?.approved_by} ({gateForCurrent?.gate?.date}).
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {prereqMissing.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-300">
                <ShieldAlert className="w-4 h-4" />
                Prerequisite gates missing: phases {prereqMissing.join(", ")}.
              </div>
            )}
            <p className="text-sm text-gray-400">
              Approving writes <code className="text-gray-500">gates/phase{currentPhase}-{ph?.slug}-approval.json</code>{" "}
              to the workspace, unblocking the next phase.
            </p>
            <button
              onClick={() => onApproveGate(currentPhase, selected.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-black hover:brightness-110 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Phase {currentPhase} Gate
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
      <div className={`text-xl font-black ${tone === "warn" ? "text-amber-300" : "text-emerald-300"}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function CtrlBtn({
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  onClick: () => void;
  icon: typeof Play;
  label: string;
  tone: "go" | "stop" | "neutral";
}) {
  const styles =
    tone === "go"
      ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
      : tone === "stop"
      ? "border-red-500/40 text-red-300 hover:bg-red-500/10"
      : "border-zinc-700 text-gray-300 hover:bg-zinc-800/50";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border transition ${styles}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
