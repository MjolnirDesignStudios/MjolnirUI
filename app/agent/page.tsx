import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Agentic AI • MjolnirUI",
  description: "OdinAI — the agentic UI/UX designer powered by Claude.",
};

export default function AgentPage() {
  return (
    <ComingSoon
      title="OdinAI Agent"
      description="OdinAI — our agentic UI/UX designer — is in active development. It composes components, generates token systems, and builds whole layouts from natural-language briefs. Available to Pro and Elite subscribers at launch."
      eta="Q3 2026"
      fallback={{ label: "View pricing", href: "/pricing" }}
    />
  );
}
