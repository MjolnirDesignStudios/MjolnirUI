"use client";

import { ArrowRight } from "lucide-react";
import type { GameView, SwarmEvent } from "@/lib/gaming/types";
import { AGENTS, GOVERNANCE, PHASES, phaseMeta } from "@/lib/gaming/agents";
import type { GateRow } from "./GamingStudio";

const ENGINE_LABEL: Record<string, string> = {
  godot4: "Godot 4",
  unity6: "Unity 6",
  unreal5: "Unreal 5",
  unreal6: "Unreal 6",
};

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_STYLE: Record<string, string> = {
  active: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  launched: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
  paused: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  planned: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30",
};

export function StudioOverview({
  games,
  events,
  gates,
  onOpenTitle,
}: {
  games: GameView[];
  events: SwarmEvent[];
  gates: GateRow[];
  onOpenTitle: (id: string) => void;
}) {
  const lastEvent = events[events.length - 1];
  const activeAgent = lastEvent?.agent;
  const isRunning =
    !!lastEvent &&
    Date.now() - new Date(lastEvent.ts).getTime() < 5 * 60 * 1000 &&
    lastEvent.event !== "run_done";

  return (
    <div className="space-y-10">
      {/* Title cards */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Titles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {games.map((g) => {
            const ph = phaseMeta(g.phase);
            return (
              <button
                key={g.id}
                onClick={() => onOpenTitle(g.id)}
                className="group text-left rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5 hover:border-purple-500/60 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{g.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ENGINE_LABEL[g.engine] || g.engine}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                      STATUS_STYLE[g.status] || STATUS_STYLE.planned
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-purple-300 font-semibold">
                    {ph ? `Phase ${ph.n} · ${ph.name}` : "Phase —"}
                  </span>
                  {g.halted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                      HALTED
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {g.lastEvent
                      ? `${g.lastEvent.agent} · ${g.lastEvent.event} · ${timeAgo(g.lastEvent.ts)}`
                      : "no recent activity"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition" />
                </div>
              </button>
            );
          })}
          {games.length === 0 && (
            <p className="text-gray-500 text-sm">No titles registered in studio.json.</p>
          )}
        </div>
      </section>

      {/* Agent roster */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">The Swarm</h2>
          <span className="text-xs text-gray-500">
            {isRunning ? (
              <span className="text-emerald-300">● running — {activeAgent}</span>
            ) : (
              "idle"
            )}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {AGENTS.map((a) => {
            const on = isRunning && activeAgent === a.id;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 bg-linear-to-br from-zinc-900 to-black transition ${
                  on ? "border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.15)]" : "border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <div>
                    <div className={`font-bold ${a.accent}`}>{a.name}</div>
                    <div className="text-[11px] text-gray-500">{a.role}</div>
                  </div>
                  <span
                    className={`ml-auto w-2.5 h-2.5 rounded-full ${
                      on ? `${a.dot} animate-pulse` : "bg-zinc-700"
                    }`}
                  />
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{a.persona}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Pipeline: Planr → Buildr → [Gamr ‖ Testr] → Modr → loop. One layer below OdinAI.
        </p>
      </section>

      {/* Governance + gate summary */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
            Governance Layer
          </h2>
          <div className="space-y-3">
            {GOVERNANCE.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <span className="text-xl">{g.emoji}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{g.name}</div>
                  <div className="text-[11px] text-gray-500">{g.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
            Phase Gates
          </h2>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => {
              const row = gates.find((r) => r.phase === p.n);
              const approved = !!row?.gate;
              return (
                <span
                  key={p.n}
                  title={
                    approved
                      ? `Approved by ${row?.gate?.approved_by ?? "?"} (${row?.gate?.date ?? ""})`
                      : "Not yet approved"
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                    approved
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                      : "border-zinc-700 text-gray-500"
                  }`}
                >
                  {approved ? "✓ " : ""}
                  {p.n}. {p.name}
                </span>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
