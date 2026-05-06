export const metadata = {
  title: "Privacy Policy • MjolnirUI",
  description: "How MjolnirUI collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-05-01">May 1, 2026</time>
      </p>

      <p className="text-gray-300 leading-relaxed">
        Mjolnir Design Studios LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
        &ldquo;Mjolnir&rdquo;) operates MjolnirUI (the &ldquo;Service&rdquo;).
        This Privacy Policy explains what information we collect, how we use it,
        and the choices you have. By using the Service you agree to the practices
        described here.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect three categories of data:</p>
      <ul>
        <li>
          <strong>Account data</strong> — name, email address, and OAuth profile
          identifiers from Google or GitHub when you sign in. Stored in our
          authentication database (Supabase).
        </li>
        <li>
          <strong>Subscription data</strong> — billing details and payment status
          processed through Stripe. We do not store full payment card numbers.
        </li>
        <li>
          <strong>Usage data</strong> — pages visited, components clicked, saved
          assets created, and tier-related events used to operate and improve the
          Service.
        </li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>To provide, maintain, and personalize the Service.</li>
        <li>To process subscriptions, billing, and tier upgrades.</li>
        <li>To respond to support requests.</li>
        <li>
          To send transactional emails (receipts, password changes, tier-change
          confirmations). We do not sell your data.
        </li>
        <li>To detect, prevent, and address abuse or fraud.</li>
      </ul>

      <h2>3. Third-party processors</h2>
      <p>The Service uses the following sub-processors:</p>
      <ul>
        <li><strong>Vercel</strong> — hosting and edge delivery.</li>
        <li><strong>Supabase</strong> — authentication and primary database.</li>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Resend</strong> — transactional email delivery.</li>
        <li><strong>Anthropic</strong> — AI features (OdinAI), Pro/Elite only.</li>
      </ul>
      <p>
        Each sub-processor has its own privacy and security commitments which
        you can review on their respective sites.
      </p>

      <h2>4. Cookies</h2>
      <p>
        We use cookies for authentication and basic functionality. See our{" "}
        <a href="/legal/cookies">Cookie Policy</a> for details and choices.
      </p>

      <h2>5. Your rights</h2>
      <p>You may at any time:</p>
      <ul>
        <li>Request a copy of the personal data we hold about you.</li>
        <li>Correct inaccurate data via your account settings.</li>
        <li>Delete your account and associated data (export available on request).</li>
        <li>
          Withdraw consent for non-essential processing, where applicable. EU/UK
          residents have additional rights under the GDPR/UK GDPR; California
          residents have rights under the CCPA.
        </li>
      </ul>

      <h2>6. Data retention</h2>
      <p>
        Account data is retained while your account is active. After deletion, we
        purge personal data within 30 days, except where law requires longer
        retention (e.g. tax records related to subscriptions).
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard encryption in transit (TLS) and at rest, plus
        Row Level Security on user data in our database. No system is perfectly
        secure; if a breach occurs that affects your data, we will notify you in
        accordance with applicable law.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not intended for users under 13. We do not knowingly
        collect data from children.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Policy. Material changes will be announced via email
        and a banner notice on the site at least 14 days before they take
        effect.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or requests regarding privacy can be sent to{" "}
        <a href="mailto:privacy@mjolnirdesignstudios.com">
          privacy@mjolnirdesignstudios.com
        </a>
        .
      </p>
    </>
  );
}
