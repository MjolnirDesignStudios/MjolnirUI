"use client";

import { useMemo, useState } from "react";
import type { GameView, SwarmEvent } from "@/lib/gaming/types";
import { AGENTS, agentMeta } from "@/lib/gaming/agents";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  return d.toISOString().slice(11, 19);
}

function detailOf(e: SwarmEvent): string {
  const bits: string[] = [];
  if (e.file) bits.push(String(e.file).split(/[\\/]/).pop() || "");
  if (e.sprint_goal) bits.push("sprint set");
  if (e.id && e.severity) bits.push(`${e.id} · ${e.severity}`);
  if (typeof e.bugs_found === "number") bits.push(`${e.bugs_found} bugs`);
  if (typeof e.patch_tasks === "number") bits.push(`${e.patch_tasks} patch tasks`);
  if (typeof e.coverage_pct === "number") bits.push(`${e.coverage_pct}% cov`);
  if (e.status) bits.push(String(e.status));
  if (e.iteration) bits.push(`iter ${e.iteration}`);
  return bits.join(" · ");
}

export function LiveMonitor({ events, games }: { events: SwarmEvent[]; games: GameView[] }) {
  const [game, setGame] = useState<string>("");
  const [agent, setAgent] = useState<string>("");

  const filtered = useMemo(() => {
    let evs = events;
    if (game) evs = evs.filter((e) => e.game === game || e.game_id === game);
    if (agent) evs = evs.filter((e) => e.agent === agent);
    return [...evs].reverse();
  }, [events, game, agent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-purple-500 outline-none"
        >
          <option value="">All titles</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-purple-500 outline-none"
        >
          <option value="">All agents</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
          <option value="orchestrator">Orchestrator</option>
        </select>
        <span className="text-xs text-gray-500">{filtered.length} events</span>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-black/60 font-mono text-[12px] max-h-[560px] overflow-y-auto divide-y divide-zinc-900">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-600">No events match this filter.</div>
        )}
        {filtered.map((e, i) => {
          const meta = agentMeta(e.agent);
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-2 hover:bg-zinc-900/50">
              <span className="text-gray-600 shrink-0">{fmtTime(e.ts)}</span>
              <span className={`shrink-0 w-20 font-bold ${meta?.accent || "text-gray-300"}`}>
                {e.agent}
              </span>
              <span className="text-gray-300 shrink-0">{e.event}</span>
              <span className="text-gray-600 truncate">{detailOf(e)}</span>
              {(e.game || e.game_id) && (
                <span className="ml-auto shrink-0 text-[10px] text-gray-700">
                  {e.game || e.game_id}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
