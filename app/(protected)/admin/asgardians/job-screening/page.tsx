"use client";

// Job Screening — Firecrawl job search ranked by Claude against an associate's credentials.
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Associate = { id: string; full_name: string; location: string | null; status: string };
type Match = {
  title: string;
  company?: string | null;
  url?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  remote?: boolean | null;
  score: number;
  rationale: string;
};

export default function JobScreening() {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [associateId, setAssociateId] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("25");
  const [remote, setRemote] = useState(false);
  const [minSalary, setMinSalary] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [running, setRunning] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/asgardians/associates")
      .then((r) => r.json())
      .then((d) => setAssociates(d.associates ?? []))
      .catch(() => toast.error("Failed to load associates"));
  }, []);

  async function run() {
    if (!associateId) {
      toast.error("Select an associate first.");
      return;
    }
    setRunning(true);
    setConfigError(null);
    try {
      const res = await fetch("/api/asgardians/jobs/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          associateId,
          filters: {
            query: query || undefined,
            location: location || undefined,
            radiusMiles: radius ? Number(radius) : undefined,
            remote,
            minSalary: minSalary ? Number(minSalary) : undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setConfigError(data.error);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "screening failed");
      setMatches(data.matches);
      toast.success(`Found ${data.matches.length} top matches`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Screening failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-linear-to-r from-white via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
          🔍 Job Screening
        </h1>
        <p className="text-lg text-gray-300">
          Crawl live job listings and rank the top 10 roles against an associate&apos;s credentials.
        </p>
      </div>

      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <select
            value={associateId}
            onChange={(e) => setAssociateId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white focus:border-cyan-500 outline-none"
          >
            <option value="">Select associate…</option>
            {associates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name} ({a.status})
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Role keywords (default: from credentials)"
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white placeholder-gray-600 focus:border-cyan-500 outline-none"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (default: associate's)"
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white placeholder-gray-600 focus:border-cyan-500 outline-none"
          />
          <input
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            type="number"
            placeholder="Radius (miles)"
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white placeholder-gray-600 focus:border-cyan-500 outline-none"
          />
          <input
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            type="number"
            placeholder="Min salary ($)"
            className="px-4 py-2 rounded-lg bg-black border border-zinc-700 text-sm text-white placeholder-gray-600 focus:border-cyan-500 outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
            Remote only
          </label>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="px-6 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-emerald-500 text-black font-bold disabled:opacity-50"
        >
          {running ? "Screening…" : "Run Screening"}
        </button>
      </div>

      {configError && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-5 text-amber-300 text-sm">
          <p className="font-bold mb-1">Firecrawl not configured</p>
          <p>{configError}</p>
          <p className="mt-2 text-amber-400/80">
            Get a key at firecrawl.dev, then add <code className="bg-black/40 px-1 rounded">FIRECRAWL_API_KEY=fc-…</code> to{" "}
            <code className="bg-black/40 px-1 rounded">.env.local</code> and restart the dev server.
          </p>
        </div>
      )}

      {matches && (
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-zinc-800">
                <th className="p-3">#</th>
                <th className="p-3">Role</th>
                <th className="p-3">Company</th>
                <th className="p-3">Location</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Fit</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={i} className="border-b border-zinc-800/50 align-top">
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3">
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline font-semibold">
                        {m.title}
                      </a>
                    ) : (
                      <span className="font-semibold text-white">{m.title}</span>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{m.rationale}</p>
                  </td>
                  <td className="p-3 text-gray-300">{m.company ?? "—"}</td>
                  <td className="p-3 text-gray-300">
                    {m.remote ? "Remote" : (m.location ?? "—")}
                  </td>
                  <td className="p-3 text-gray-300">{m.salaryRange ?? "—"}</td>
                  <td className="p-3">
                    <span className={`font-black ${m.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                      {m.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
