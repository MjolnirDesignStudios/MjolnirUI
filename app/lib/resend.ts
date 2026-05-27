// app/lib/resend.ts
// Lazy-init Resend client + transactional email helpers.
//
// CRITICAL: every send is fail-soft. Email failure must NEVER cause a
// webhook handler to return non-200, otherwise Stripe will retry and
// we'll double-process the upgrade. The pattern is always:
//
//     await sendWelcomePro(...).catch((e) => console.error(e));
//
// If RESEND_API_KEY isn't set in the environment, sends return early
// with a console.warn — the app continues to function without email.

import { Resend } from "resend";
import { render } from "@react-email/components";
import WelcomePro, { type WelcomeProEmailProps } from "@/emails/WelcomePro";
import { TIER_CONFIG, type TierName } from "@/lib/tierConfig";

// Default From: uses contact@mjolnirdesignstudios.com — that's the verified
// inbox we already have on file. Override via RESEND_FROM_ADDRESS env var
// once a dedicated mjolnirui.com address is in place.
const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ||
  "MjolnirUI <contact@mjolnirdesignstudios.com>";
const APP_URL = process.env.NEXTAUTH_URL || "https://www.mjolnirui.com";

let _client: Resend | null | undefined;

/** Lazy-init guard. Returns null if RESEND_API_KEY isn't configured. */
function getClient(): Resend | null {
  if (_client !== undefined) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    _client = null;
    return null;
  }
  _client = new Resend(key);
  return _client;
}

interface SendWelcomeProInput {
  to: string;
  firstName?: string;
  tier: TierName;
}

/**
 * Send the "Welcome to MjolnirUI Pro" transactional email.
 * Fail-soft — returns boolean indicating whether the send was attempted
 * + succeeded. Logs failures but never throws.
 */
export async function sendWelcomePro({
  to,
  firstName,
  tier,
}: SendWelcomeProInput): Promise<boolean> {
  const client = getClient();
  if (!client) {
    console.warn(
      "[resend] RESEND_API_KEY not set — skipping welcome email send."
    );
    return false;
  }

  if (!to || typeof to !== "string" || !to.includes("@")) {
    console.warn("[resend] Invalid 'to' address — skipping:", to);
    return false;
  }

  const tierConfig = TIER_CONFIG[tier];
  const props: WelcomeProEmailProps = {
    firstName: firstName?.trim() || "Builder",
    tierLabel: tierConfig.label,
    tierColor: tierConfig.color,
    dashboardUrl: `${APP_URL}/blocks/dashboard`,
    docsUrl: `${APP_URL}/blocks/docs`,
  };

  try {
    const html = await render(WelcomePro(props));
    const text = await render(WelcomePro(props), { plainText: true });

    const { error } = await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Welcome to MjolnirUI ${tierConfig.label}, ${props.firstName} ⚡`,
      html,
      text,
    });

    if (error) {
      console.error("[resend] sendWelcomePro failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[resend] sendWelcomePro threw:", err);
    return false;
  }
}
