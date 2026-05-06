import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Help Center • MjolnirUI",
  description: "Get help and support for MjolnirUI.",
};

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help Center"
      description="Self-serve guides, troubleshooting, and walkthroughs are coming soon. Need help right now? Reach out via email and we'll get back to you within a business day."
      eta="June 2026"
      fallback={{
        label: "Email support",
        href: "mailto:support@mjolnirdesignstudios.com",
      }}
    />
  );
}
