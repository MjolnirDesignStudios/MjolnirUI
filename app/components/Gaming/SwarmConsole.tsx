"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { GameView, QueuedPrompt } from "@/lib/gaming/types";
import { AGENTS } from "@/lib/gaming/agents";

const TEMPLATES: { key: string; label: string; route: string; text: string }[] = [
  { key: "entity", label: "🆕 New Entity", route: "buildr", text: "Add a new entity: [name]. Ring/tier: [1-3]. Threat: [low/med/high]. Weakness: [tool]. Behaviour: [describe]." },
  { key: "feature", label: "✨ New Feature", route: "planr", text: "Plan + implement feature: [name]. Where it fits in the core loop: [describe]. Acceptance criteria: [list]." },
  { key: "asset", label: "🎨 Generate Asset", route: "buildr", text: "Generate asset: [type — sprite/sfx/ui]. Subject: [describe]. Style: gothic dark-fantasy, spectral glow." },
  { key: "fix", label: "🐛 Fix Bug", route: "modr", text: "Triage + fix bug: [id or describe]. File: [path]. Expected behaviour: [describe]." },
  { key: "balance", label: "⚖️ Balance Pass", route: "gamr", text: "Balance pass: tune [system] so that [goal]. Current values: [list]. Target feel: [describe]." },
];

export function SwarmConsole({ games }: { games: GameView[] }) {
  const [queue, setQueue] = useState<QueuedPrompt[]>([]);
  const [route, setRoute] = useState("planr");
  const [game, setGame] = useState("");
  const [text, setText] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const j = await fetch("/api/gaming/prompts").then((r) => r.json());
      setAvailable(j.available ?? false);
      setQueue(j.queue || []);
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!game && games.length) {
      const active = games.find((g) => g.status === "active");
      setGame(active?.id || games[0].id);
    }
  }, [games, game]);

  const send = useCallback(async () => {
    const prompt = text.trim();
    if (!prompt) return;
    setSending(true);
    try {
      const res = await fetch("/api/gaming/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route, game, prompt }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setQueue(j.queue || []);
        setText("");
        toast.success(`Queued ${j.entry?.id} → ${route}`);
      } else {
        toast.error(j.error || "Failed to queue prompt");
      }
    } finally {
      setSending(false);
    }
  }, [text, route, game]);

  const clearQueue = useCallback(async () => {
    const res = await fetch("/api/gaming/prompts", { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) {
      setQueue([]);
      toast.success("Queue cleared");
    } else toast.error("Could not clear queue");
  }, []);

  const pending = queue.filter((q) => q.status === "queued").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Composer */}
      <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Compose Directive</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setText(t.text);
                setRoute(t.route);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full border border-zinc-700 text-gray-300 hover:border-purple-500 hover:text-white transition"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-purple-500 outline-none"
          >
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                → {a.name}
              </option>
            ))}
          </select>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-purple-500 outline-none"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          rows={5}
          placeholder="Describe what the swarm should build…  e.g. Add a Banshee entity, Ring 2, weakness UV. ⌘/Ctrl+Enter to queue."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-gray-200 focus:border-purple-500 outline-none resize-y"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-gray-600">
            Queues to <code className="text-gray-500">prompt_queue.json</code> — Planr folds queued directives into the next sprint.
          </span>
          <button
            onClick={send}
            disabled={sending || !text.trim() || available === false}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-linear-to-r from-purple-500 to-purple-600 text-white hover:brightness-110 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            Queue
          </button>
        </div>
        {available === false && (
          <p className="text-[11px] text-amber-300/80 mt-2">Workspace offline — connect locally to queue directives.</p>
        )}
      </div>

      {/* Queue */}
      <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Queue <span className="text-purple-300">{pending ? `· ${pending} pending` : ""}</span>
          </h3>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="text-gray-600 text-sm">No directives queued. Compose one to feed the swarm.</p>
        ) : (
          <div className="space-y-2 max-h-[440px] overflow-y-auto">
            {[...queue].reverse().map((q) => {
              const a = AGENTS.find((x) => x.id === q.route);
              return (
                <div key={q.id} className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className={`font-bold ${a?.accent || "text-gray-300"}`}>
                      {a?.emoji} {a?.name || q.route}
                    </span>
                    {q.game && <span className="text-gray-600">· {q.game}</span>}
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full ${
                        q.status === "consumed"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {q.status}
                      {q.status === "consumed" && q.consumed_iteration ? ` · iter ${q.consumed_iteration}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{q.prompt}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
