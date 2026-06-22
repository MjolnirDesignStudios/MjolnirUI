// Mjolnir Gaming Studio — shared types for the admin cockpit.
// Mirrors the workspace files written by the buildr agent swarm.

export type EngineId = "godot4" | "unity6" | "unreal5" | "unreal6" | string;
export type GameStatus = "active" | "planned" | "paused" | "launched" | string;

export interface Game {
  id: string;
  name: string;
  engine: EngineId;
  path: string;
  design_doc?: string;
  prototype_path?: string;
  web_export_path?: string;
  status: GameStatus;
  priority?: number;
  phase?: number; // 1-8 lifecycle phase
  max_iterations?: number;
}

export interface StudioConfig {
  studio: string;
  games: Game[];
}

export interface SwarmEvent {
  ts: string;
  agent: string; // planr | buildr | gamr | testr | modr | orchestrator
  event: string;
  game?: string;
  game_id?: string;
  iteration?: number;
  file?: string;
  id?: string;
  severity?: string;
  status?: string;
  sprint_goal?: string;
  bugs_found?: number;
  coverage_pct?: number;
  tests_failing?: number;
  patch_tasks?: number;
  [k: string]: unknown;
}

export interface Bug {
  id: string;
  severity: "high" | "medium" | "low" | string;
  description: string;
  file?: string;
  line_hint?: number;
}

export interface QaReport {
  game_id?: string;
  iteration?: number;
  status?: string;
  bugs?: Bug[];
  screenshots?: string[];
  ai_logic_notes?: string;
  gameplay_notes?: string;
}

export interface BuildManifest {
  game_id?: string;
  iteration?: number;
  changed_files?: string[];
  new_features?: string[];
  web_export_ready?: boolean;
  web_export_path?: string;
  notes_for_gamr?: string;
  notes_for_testr?: string;
}

export interface TestResultFile {
  id: string;
  file: string;
  coverage_pct?: number;
  tests_written?: number;
  tests_passing?: number;
  tests_failing?: number;
  failures?: { test: string; error: string }[];
}

export interface TestReport {
  game_id?: string;
  iteration?: number;
  status?: string;
  coverage_summary?: { total_files: number; tested_files: number; overall_pct: number };
  test_results?: TestResultFile[];
  performance_notes?: string;
  coverage_regressions?: string[];
}

export interface SprintFeature {
  id: string;
  priority?: string;
  title: string;
  description?: string;
  acceptance_criteria?: string[];
}

export interface SprintPlan {
  game_id?: string;
  iteration?: number;
  sprint_goal?: string;
  features?: SprintFeature[];
  out_of_scope?: string[];
  notes_for_buildr?: string;
}

export interface PatchTask {
  id: string;
  priority?: string;
  file?: string;
  instruction?: string;
}

export interface PatchTasks {
  game_id?: string;
  iteration?: number;
  tasks?: PatchTask[];
  design_gaps?: string[];
}

export interface Gate {
  phase: string | number;
  game_id?: string;
  approved_by?: string;
  reviewed_by?: string[];
  date?: string;
  notes?: string;
  conditions?: string[];
  [k: string]: unknown;
}

export interface GameReports {
  sprint_plan: SprintPlan | null;
  build_manifest: BuildManifest | null;
  qa_report: QaReport | null;
  test_report: TestReport | null;
  patch_tasks: PatchTasks | null;
}

export interface AnnaReport {
  name: string;
  game?: string;
  mtime: string;
  content: string;
}

// A human build directive composed in the admin Console and queued for the
// swarm. Planr reads queued entries and folds them into the next sprint.
export interface QueuedPrompt {
  id: string;
  ts: string;
  route: string; // target agent id (planr | buildr | gamr | testr | modr)
  game?: string;
  prompt: string;
  status: "queued" | "consumed";
  consumed_iteration?: number;
  requested_by?: string;
}

// Derived view-model the /studio endpoint returns per game.
export interface GameView extends Game {
  phaseSlug?: string;
  gatesApproved: number[]; // phases with an approval file present
  lastEvent?: SwarmEvent | null;
  halted?: boolean;
}
