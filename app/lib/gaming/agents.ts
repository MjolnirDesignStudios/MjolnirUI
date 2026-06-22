// Mjolnir Gaming Studio — static metadata for the 5-agent swarm and the
// 8-phase lifecycle. The swarm sits one layer below OdinAI in the MDS hierarchy.

export interface AgentMeta {
  id: string;
  name: string;
  role: string;
  persona: string;
  voice: string;
  emoji: string;
  accent: string; // tailwind text color class
  dot: string; // tailwind bg color class for status dot
}

// Pipeline order: Planr -> Buildr -> [Gamr || Testr] -> Modr -> loop
export const AGENTS: AgentMeta[] = [
  {
    id: "planr",
    name: "Planr",
    role: "Sprint Planner",
    persona: "Senior game producer who has shipped 15 titles. Ruthless about scope.",
    voice: "Structured. Numbered. This sprint: X. Not this sprint: Y.",
    emoji: "🗂️",
    accent: "text-pink-400",
    dot: "bg-pink-400",
  },
  {
    id: "buildr",
    name: "Buildr",
    role: "Build Engineer",
    persona: "Engine-aware builder — Unity 6 / Godot 4 / Unreal. Writes code and game assets.",
    voice: "Implements the sprint, file by file. Reports what changed.",
    emoji: "🔨",
    accent: "text-purple-400",
    dot: "bg-purple-400",
  },
  {
    id: "gamr",
    name: "Gamr",
    role: "QA / Playtester",
    persona: "Tests the game like a real player trying to break it. Files bugs.",
    voice: "Found it. BUG-02, high: ghost spawn rate ignores the cap.",
    emoji: "🎮",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    id: "testr",
    name: "Testr",
    role: "Test Engineer",
    persona: "Senior SDET. Doesn't play games — analyzes them. Tracks coverage obsessively.",
    voice: "Metrics-driven. GameManager.cs: 94% coverage. 0 failing.",
    emoji: "🧪",
    accent: "text-sky-400",
    dot: "bg-sky-400",
  },
  {
    id: "modr",
    name: "Modr",
    role: "Fix Planner",
    persona: "Reads QA + test reports, triages, and writes precise patch tasks for Buildr.",
    voice: "Triaged 10 findings into 9 patch tasks. Foundation first.",
    emoji: "🛠️",
    accent: "text-amber-400",
    dot: "bg-amber-400",
  },
];

export const AGENT_IDS = AGENTS.map((a) => a.id);

export function agentMeta(id: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.id === id);
}

export interface PhaseMeta {
  n: number;
  slug: string;
  name: string;
  swarm: boolean; // does the swarm execute in this phase?
}

export const PHASES: PhaseMeta[] = [
  { n: 1, slug: "planning", name: "Planning", swarm: false },
  { n: 2, slug: "preproduction", name: "Pre-Production", swarm: false },
  { n: 3, slug: "alpha", name: "Build (Alpha)", swarm: true },
  { n: 4, slug: "beta", name: "Testing (Beta)", swarm: true },
  { n: 5, slug: "polish", name: "Quality & Polish", swarm: true },
  { n: 6, slug: "prelaunch", name: "Pre-Launch", swarm: false },
  { n: 7, slug: "launch", name: "Launch", swarm: false },
  { n: 8, slug: "season", name: "Live Ops & Seasons", swarm: true },
];

export function phaseMeta(n?: number): PhaseMeta | undefined {
  return PHASES.find((p) => p.n === n);
}

// Governance layer above the swarm (for display context).
export const GOVERNANCE = [
  { id: "chris", name: "Chris", role: "Founder · Vision · Final authority", emoji: "👑" },
  { id: "anna", name: "ANNA", role: "Design critique · Brand consistency", emoji: "🎨" },
  { id: "odin", name: "OdinAI", role: "Enterprise oversight · Halt authority", emoji: "🛡️" },
];
