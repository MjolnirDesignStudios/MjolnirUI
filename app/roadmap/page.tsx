import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Roadmap • MjolnirUI",
  description: "What's next for MjolnirUI — the public roadmap.",
};

export default function RoadmapPage() {
  return (
    <ComingSoon
      title="Roadmap"
      description="A public-facing roadmap is on the way. Track features as they ship and weigh in on what comes next. For now, follow the GitHub repo for live progress."
      eta="Q3 2026"
    />
  );
}
