"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, Radio, Gamepad2, Palette, FolderX, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { GameView, SwarmEvent, GameReports } from "@/lib/gaming/types";
import { StudioOverview } from "./StudioOverview";
import { LiveMonitor } from "./LiveMonitor";
import { TitleDetail } from "./TitleDetail";
import { AnnaViewer } from "./AnnaViewer";
import { SwarmConsole } from "./SwarmConsole";

export type GateRow = {
  phase: number;
  slug: string;
  name: string;
  swarm: boolean;
  gate: { approved_by?: string; date?: string; notes?: string } | null;
};

type Tab = "overview" | "live" | "titles" | "console" | "anna";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "live", label: "Live Monitor", icon: Radio },
  { id: "titles", label: "Titles", icon: Gamepad2 },
  { id: "console", label: "Console", icon: MessageSquare },
  { id: "anna", label: "ANNA Reports", icon: Palette },
];

export function GamingStudio() {
  const [games, setGames] = useState<GameView[]>([]);
  const [events, setEvents] = useState<SwarmEvent[]>([]);
  const [reports, setReports] = useState<GameReports | null>(null);
  const [gates, setGates] = useState<GateRow[]>([]);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [workspace, setWorkspace] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, e, r, g] = await Promise.all([
        fetch("/api/gaming/studio").then((x) => x.json()),
        fetch("/api/gaming/events?limit=120").then((x) => x.json()),
        fetch("/api/gaming/reports").then((x) => x.json()),
        fetch("/api/gaming/gates").then((x) => x.json()),
      ]);
      setAvailable(s.available ?? false);
      setWorkspace(s.workspace || "");
      setGames(s.games || []);
      setSelected((cur) => {
        if (cur) return cur;
        const active = (s.games || []).find((x: GameView) => x.status === "active");
        return active?.id || s.games?.[0]?.id || null;
      });
      setEvents(e.events || []);
      setReports(r.reports || null);
      setGates(g.gates || []);
    } catch {
      /* network hiccup — keep last good state */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const control = useCallback(
    async (action: string, game?: string, reason?: string) => {
      const res = await fetch("/api/gaming/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, game, reason }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) toast.success(`Swarm: ${action}${game ? ` · ${game}` : ""}`);
      else toast.error(`Action failed: ${action}`);
      refresh();
    },
    [refresh]
  );

  const approveGate = useCallback(
    async (phase: number, game_id?: string, notes?: string) => {
      const res = await fetch("/api/gaming/gates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, game_id, notes }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) toast.success(`Phase ${phase} gate approved`);
      else toast.error("Gate approval failed");
      refresh();
    },
    [refresh]
  );

  const selectedGame = games.find((g) => g.id === selected) || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-white via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Gaming Studio
          </h1>
          <p className="text-gray-400 mt-2">
            The Buildr swarm — live agent activity across all Mjolnir gaming IP.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
              available
                ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                : "border-amber-500/40 text-amber-300 bg-amber-500/10"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${available ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {available ? "Workspace connected" : "Workspace offline"}
          </span>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-gray-300 hover:text-white hover:border-purple-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Offline notice */}
      {available === false && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200/90">
          <FolderX className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">No local swarm workspace detected.</p>
            <p className="mt-1 text-amber-200/70">
              Expected at <code className="text-amber-300">{workspace || "M:/Dev/mjolnir-gaming/_studio/agent-workspace"}</code>.
              Run the swarm locally and open this admin in <code className="text-amber-300">npm run dev</code> on the same machine.
              The agent roster below reflects the static swarm definition.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/70">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${
                on
                  ? "border-purple-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <StudioOverview
          games={games}
          events={events}
          gates={gates}
          onOpenTitle={(id) => {
            setSelected(id);
            setTab("titles");
          }}
        />
      )}
      {tab === "live" && <LiveMonitor events={events} games={games} />}
      {tab === "console" && <SwarmConsole games={games} />}
      {tab === "titles" && (
        <TitleDetail
          games={games}
          selected={selectedGame}
          onSelect={setSelected}
          reports={reports}
          gates={gates}
          onControl={control}
          onApproveGate={approveGate}
        />
      )}
      {tab === "anna" && <AnnaViewer selected={selectedGame} />}
    </div>
  );
}
