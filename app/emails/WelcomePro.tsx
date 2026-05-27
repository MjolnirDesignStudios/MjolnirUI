// app/emails/WelcomePro.tsx
// React Email template — "Welcome to MjolnirUI Pro" transactional message
// sent after a successful checkout.session.completed webhook fire.
//
// Renders to plain HTML via @react-email/components.render(). Inline styles
// are required (most email clients reject external stylesheets) so the
// design language here is "Mjolnir aesthetic, email-safe": no shaders, no
// gradients beyond what gmail/Apple Mail render reliably, no custom fonts.
//
// Branded gold/cyan accents on a storm-dark background; falls back to a
// light theme on email clients that force light mode (Apple Mail dark
// preference handled via the body bg).

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface WelcomeProEmailProps {
  /** First-name greeting target. "Builder" when no name on file. */
  firstName?: string;
  /** Canonical tier label e.g. "Pro", "Base". */
  tierLabel?: string;
  /** Tier accent color (hex) — used on the badge + CTA button border */
  tierColor?: string;
  /** Absolute URL of the dashboard CTA. */
  dashboardUrl?: string;
  /** Absolute URL of the docs CTA. */
  docsUrl?: string;
  /** Optional support email. Defaults to contact@mjolnirdesignstudios.com. */
  supportEmail?: string;
}

export default function WelcomePro({
  firstName = "Builder",
  tierLabel = "Pro",
  tierColor = "#EAB308",
  dashboardUrl = "https://www.mjolnirui.com/blocks/dashboard",
  docsUrl = "https://www.mjolnirui.com/blocks/docs",
  supportEmail = "contact@mjolnirdesignstudios.com",
}: WelcomeProEmailProps) {
  const preview = `Welcome to MjolnirUI ${tierLabel}, ${firstName} — your arsenal is forged.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerWrap}>
            <Img
              src="https://www.mjolnirui.com/logos/MjolnirUI.png"
              width="180"
              height="auto"
              alt="MjolnirUI"
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          <Hr style={hr} />

          {/* Welcome heading */}
          <Section style={contentWrap}>
            <Heading style={h1}>
              Welcome to MjolnirUI {tierLabel}, {firstName}
            </Heading>

            <Text style={paragraph}>
              You hold Mjolnir. The full arsenal — components, shaders,
              particles, layouts, design tokens — is unlocked.
            </Text>

            {/* Tier badge */}
            <Section style={{ ...badgeWrap, borderColor: tierColor }}>
              <Text style={{ ...badgeText, color: tierColor }}>
                {tierLabel.toUpperCase()} TIER · ACTIVE
              </Text>
            </Section>

            {/* Primary CTA */}
            <Section style={{ textAlign: "center", margin: "32px 0 24px" }}>
              <Button
                href={dashboardUrl}
                style={{
                  ...primaryButton,
                  borderColor: tierColor,
                  boxShadow: `0 0 14px ${tierColor}33`,
                }}
              >
                Open your dashboard →
              </Button>
            </Section>

            <Hr style={hr} />

            {/* First-actions checklist */}
            <Heading as="h2" style={h2}>
              First three things to do
            </Heading>

            <Section style={{ padding: "0 8px" }}>
              <Text style={listItem}>
                <strong style={{ color: tierColor }}>1.</strong>{" "}
                <Link href={`${dashboardUrl.replace(/\/blocks\/.*$/, "")}/blocks/browse`} style={link}>
                  Browse the component library
                </Link>{" "}
                — 49 components across 4 categories, with copy-paste + CLI
                install.
              </Text>
              <Text style={listItem}>
                <strong style={{ color: tierColor }}>2.</strong>{" "}
                <Link href={`${dashboardUrl.replace(/\/blocks\/.*$/, "")}/blocks/background-studio`} style={link}>
                  Open the Background Studio
                </Link>{" "}
                — compose multi-layer animated backgrounds with shaders,
                particles, and mesh patterns.
              </Text>
              <Text style={listItem}>
                <strong style={{ color: tierColor }}>3.</strong>{" "}
                <Link href={docsUrl} style={link}>
                  Read the docs
                </Link>{" "}
                — installation, CLI reference, recipes, customization.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Support footer */}
            <Text style={paragraphSmall}>
              Questions, bugs, or feedback? Reply to this email or write to{" "}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
              .
            </Text>
            <Text style={paragraphSmall}>
              Manage your subscription or download invoices from your{" "}
              <Link href={`${dashboardUrl.replace(/\/blocks\/.*$/, "")}/blocks/account/subscription`} style={link}>
                billing page
              </Link>
              .
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Forged in Asgard · Mjolnir Design Studios
            </Text>
            <Text style={footerText}>
              <Link href="https://www.mjolnirui.com" style={footerLink}>
                mjolnirui.com
              </Link>
              {"  ·  "}
              <Link
                href="https://www.mjolnirui.com/legal/commercial-license"
                style={footerLink}
              >
                Commercial License
              </Link>
              {"  ·  "}
              <Link
                href="https://www.mjolnirui.com/legal/privacy"
                style={footerLink}
              >
                Privacy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles (inline, email-safe) ─────────────────────────── */
const body: React.CSSProperties = {
  backgroundColor: "#020617",
  color: "#e4e4e7",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#0a0a0f",
  border: "1px solid #27272a",
  borderRadius: "16px",
  overflow: "hidden",
};

const headerWrap: React.CSSProperties = {
  padding: "32px 32px 16px",
  textAlign: "center",
};

const contentWrap: React.CSSProperties = {
  padding: "0 32px",
};

const h1: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: 800,
  lineHeight: 1.25,
  margin: "12px 0 16px",
};

const h2: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 700,
  margin: "24px 0 12px",
};

const paragraph: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const paragraphSmall: React.CSSProperties = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: 1.6,
  margin: "0 0 8px",
};

const badgeWrap: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 16px",
  border: "1px solid",
  borderRadius: "999px",
  margin: "8px 0",
};

const badgeText: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  margin: 0,
};

const primaryButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FFCC11",
  color: "#000000",
  fontWeight: 700,
  fontSize: "15px",
  padding: "14px 28px",
  borderRadius: "12px",
  border: "1px solid",
  textDecoration: "none",
};

const listItem: React.CSSProperties = {
  color: "#e4e4e7",
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "0 0 12px",
};

const link: React.CSSProperties = {
  color: "#FFCC11",
  textDecoration: "underline",
};

const hr: React.CSSProperties = {
  borderTop: "1px solid #27272a",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  padding: "16px 32px 32px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  color: "#52525b",
  fontSize: "11px",
  margin: "0 0 4px",
};

const footerLink: React.CSSProperties = {
  color: "#71717a",
  textDecoration: "none",
};
