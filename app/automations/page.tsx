import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Automations • MjolnirUI",
  description: "Workflow automation tools for design and development.",
};

export default function AutomationsPage() {
  return (
    <ComingSoon
      title="Automations"
      description="One-click workflows that turn design specs into shipped components. Auto-export tokens, sync palettes across projects, deploy themes through CI. Coming with the OdinAI launch."
      eta="Q3 2026"
      fallback={{ label: "View pricing", href: "/pricing" }}
    />
  );
}
