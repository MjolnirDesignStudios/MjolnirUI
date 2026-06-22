// Mjolnir Gaming Studio — server-only reader/writer for the local agent
// workspace produced by the buildr swarm.
//
// The swarm runs locally and writes files under:
//   <GAMING_ROOT>/_studio/agent-workspace/
// This module reads those files for the admin cockpit. It is intentionally
// fail-safe: if the workspace path does not exist (e.g. on a deployed Vercel
// build that has no access to the local M: drive), every reader returns an
// empty/neutral value instead of throwing, so the UI degrades gracefully.
//
// NOTE: import only from server code (route handlers). Uses node:fs.

import fs from "node:fs";
import path from "node:path";
import type {
  StudioConfig, Game, GameView, SwarmEvent, GameReports, Gate, AnnaReport,
  SprintPlan, BuildManifest, QaReport, TestReport, PatchTasks, QueuedPrompt,
} from "./types";
import { PHASES } from "./agents";

export const WORKSPACE_PATH =
  process.env.GAMING_WORKSPACE_PATH ||
  "M:/Dev/mjolnir-gaming/_studio/agent-workspace";

export const GAMING_ROOT =
  process.env.GAMING_ROOT || path.resolve(WORKSPACE_PATH, "..", "..");

export function workspaceAvailable(): boolean {
  try {
    return fs.existsSync(WORKSPACE_PATH);
  } catch {
    return false;
  }
}

function wpath(...p: string[]): string {
  return path.join(WORKSPACE_PATH, ...p);
}

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

export function readJson<T = unknown>(rel: string): T | null {
  try {
    const fp = wpath(rel);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(stripBom(fs.readFileSync(fp, "utf-8"))) as T;
  } catch {
    return null;
  }
}

function writeJsonAbs(fp: string, data: unknown): boolean {
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function writeWorkspaceJson(rel: string, data: unknown): boolean {
  return writeJsonAbs(wpath(rel), data);
}

export function deleteWorkspaceFile(rel: string): boolean {
  try {
    const fp = wpath(rel);
    if (fs.existsSync(fp)) fs.rmSync(fp);
    return true;
  } catch {
    return false;
  }
}

// ── Events ────────────────────────────────────────────────────────────────
export interface EventQuery {
  game?: string;
  agent?: string;
  limit?: number;
}

export function readEvents(q: EventQuery = {}): SwarmEvent[] {
  try {
    const fp = wpath("events.jsonl");
    if (!fs.existsSync(fp)) return [];
    let events = stripBom(fs.readFileSync(fp, "utf-8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l) as SwarmEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is SwarmEvent => e !== null);

    if (q.game) events = events.filter((e) => e.game === q.game || e.game_id === q.game);
    if (q.agent) events = events.filter((e) => e.agent === q.agent);

    const limit = q.limit ?? 200;
    return events.slice(-limit);
  } catch {
    return [];
  }
}

// ── Gates ─────────────────────────────────────────────────────────────────
export function readGate(phase: number): Gate | null {
  const meta = PHASES.find((p) => p.n === phase);
  if (!meta) return null;
  return readJson<Gate>(path.join("gates", `phase${phase}-${meta.slug}-approval.json`));
}

export function approvedGatePhases(): number[] {
  return PHASES.filter((p) => readGate(p.n) !== null).map((p) => p.n);
}

export function writeGate(phase: number, data: Gate): boolean {
  const meta = PHASES.find((p) => p.n === phase);
  if (!meta) return false;
  return writeWorkspaceJson(
    path.join("gates", `phase${phase}-${meta.slug}-approval.json`),
    data
  );
}

// ── Studio + per-game views ────────────────────────────────────────────────
export function readStudio(): StudioConfig | null {
  return readJson<StudioConfig>("studio.json");
}

export function buildGameViews(): GameView[] {
  const studio = readStudio();
  if (!studio?.games) return [];
  const approved = approvedGatePhases();
  const override = readJson<{ action?: string }>("director_override.json");
  const halted = override?.action === "halt";

  return studio.games.map((g: Game): GameView => {
    const evs = readEvents({ game: g.id, limit: 1 });
    const slug = PHASES.find((p) => p.n === g.phase)?.slug;
    return {
      ...g,
      phaseSlug: slug,
      gatesApproved: approved,
      lastEvent: evs.length ? evs[evs.length - 1] : null,
      halted,
    };
  });
}

export function readGameReports(): GameReports {
  return {
    sprint_plan: readJson<SprintPlan>("sprint_plan.json"),
    build_manifest: readJson<BuildManifest>("build_manifest.json"),
    qa_report: readJson<QaReport>("qa_report.json"),
    test_report: readJson<TestReport>("test_report.json"),
    patch_tasks: readJson<PatchTasks>("patch_tasks.json"),
  };
}

// ── Prompt queue (admin Console → swarm) ───────────────────────────────────
export function readPromptQueue(): QueuedPrompt[] {
  const q = readJson<QueuedPrompt[]>("prompt_queue.json");
  return Array.isArray(q) ? q : [];
}

export function appendPrompt(p: QueuedPrompt): QueuedPrompt[] {
  const q = readPromptQueue();
  q.push(p);
  writeWorkspaceJson("prompt_queue.json", q);
  return q;
}

export function clearPromptQueue(): boolean {
  return writeWorkspaceJson("prompt_queue.json", []);
}

// ── ANNA design-critique reports (markdown) ────────────────────────────────
export function readAnnaReports(game?: string): AnnaReport[] {
  try {
    const dir = path.join(GAMING_ROOT, ".anna", "reports");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .filter((f) => (game ? f.toLowerCase().includes(game.toLowerCase()) : true))
      .map((f) => {
        const fp = path.join(dir, f);
        const st = fs.statSync(fp);
        return {
          name: f,
          game,
          mtime: st.mtime.toISOString(),
          content: stripBom(fs.readFileSync(fp, "utf-8")),
        };
      })
      .sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  } catch {
    return [];
  }
}
