import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "FAQ • MjolnirUI",
  description: "Frequently asked questions about MjolnirUI.",
};

export default function FaqPage() {
  return (
    <ComingSoon
      title="FAQ"
      description="A proper FAQ with answers on installation, billing, and tier upgrades is coming soon. Until then, our docs cover most of what you need."
      eta="June 2026"
      fallback={{ label: "Open documentation", href: "/blocks/docs" }}
    />
  );
}
