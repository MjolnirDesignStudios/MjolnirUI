"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { AnnaReport, GameView } from "@/lib/gaming/types";

// Minimal, safe markdown rendering — headings, bullets, and inline bold only.
function renderMarkdown(md: string) {
  const lines = md.split(/\r?\n/);
  return lines.map((line, i) => {
    if (/^###\s/.test(line)) return <h4 key={i} className="text-sm font-bold text-purple-300 mt-4 mb-1">{inline(line.replace(/^###\s/, ""))}</h4>;
    if (/^##\s/.test(line)) return <h3 key={i} className="text-base font-bold text-white mt-5 mb-2">{inline(line.replace(/^##\s/, ""))}</h3>;
    if (/^#\s/.test(line)) return <h2 key={i} className="text-lg font-black text-white mt-6 mb-2">{inline(line.replace(/^#\s/, ""))}</h2>;
    if (/^[-*]\s/.test(line)) return <li key={i} className="ml-5 list-disc text-gray-300 text-sm">{inline(line.replace(/^[-*]\s/, ""))}</li>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-gray-300 text-sm leading-relaxed">{inline(line)}</p>;
  });
}

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i} className="text-white">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

export function AnnaViewer({ selected }: { selected: GameView | null }) {
  const [reports, setReports] = useState<AnnaReport[]>([]);
  const [active, setActive] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = selected ? `?game=${encodeURIComponent(selected.id)}` : "";
    fetch(`/api/gaming/anna${q}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setReports(j.reports || []);
        setActive(0);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  if (loading) return <p className="text-gray-500 text-sm">Loading ANNA reports…</p>;

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-8 text-center">
        <Palette />
        <p className="text-gray-400 mt-3">No ANNA design-critique reports yet.</p>
        <p className="text-gray-600 text-sm mt-1">
          ANNA writes to <code className="text-gray-500">.anna/reports/</code> during pre-production and beta reviews.
        </p>
      </div>
    );
  }

  const current = reports[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-2">
        {reports.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setActive(i)}
            className={`w-full text-left rounded-xl border p-3 transition ${
              i === active ? "border-purple-500 bg-purple-500/10" : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileText className="w-4 h-4 text-purple-300 shrink-0" />
              <span className="truncate">{r.name}</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{new Date(r.mtime).toLocaleString()}</div>
          </button>
        ))}
      </div>
      <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-black p-6 max-h-[600px] overflow-y-auto">
        {current && <div className="space-y-0.5">{renderMarkdown(current.content)}</div>}
      </div>
    </div>
  );
}

function Palette() {
  return <div className="text-4xl">🎨</div>;
}
