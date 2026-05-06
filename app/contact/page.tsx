import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Contact • MjolnirUI",
  description: "Get in touch with the Mjolnir Design Studios team.",
};

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact"
      description="Our full contact form is forging in Asgard. In the meantime, drop us an email and we'll respond within one business day."
      eta="June 2026"
      fallback={{
        label: "Email support@mjolnirdesignstudios.com",
        href: "mailto:support@mjolnirdesignstudios.com",
      }}
    />
  );
}
