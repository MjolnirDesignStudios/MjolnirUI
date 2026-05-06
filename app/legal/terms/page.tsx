export const metadata = {
  title: "Terms of Service • MjolnirUI",
  description: "The terms governing your use of MjolnirUI.",
};

export default function TermsOfService() {
  return (
    <>
      <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-05-01">May 1, 2026</time>
      </p>

      <p className="text-gray-300 leading-relaxed">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of MjolnirUI
        (the &ldquo;Service&rdquo;), provided by Mjolnir Design Studios LLC
        (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By creating an account or using the
        Service you agree to these Terms.
      </p>

      <h2>1. Account</h2>
      <p>
        You must provide accurate information when creating an account. You are
        responsible for safeguarding your credentials and for all activity under
        your account. Notify us immediately of any unauthorized use.
      </p>

      <h2>2. Subscriptions and billing</h2>
      <ul>
        <li>
          Paid plans (Base, Pro, Elite) are billed monthly or annually via Stripe.
        </li>
        <li>
          Subscriptions auto-renew unless cancelled before the end of the current
          billing period.
        </li>
        <li>
          Cancellations take effect at the end of the current period; we do not
          provide pro-rated refunds for partial periods, except where required by
          law.
        </li>
        <li>
          Tier downgrades take effect at renewal; you keep current-tier features
          until then.
        </li>
        <li>Prices may change with 30 days&apos; notice for new billing cycles.</li>
      </ul>

      <h2>3. License to use components</h2>
      <p>
        Components and code provided through the Service are licensed to you for
        use in your own products. You may use, copy, and modify components in
        commercial and non-commercial projects.
      </p>
      <p>You may not:</p>
      <ul>
        <li>
          Resell or redistribute MjolnirUI components as a standalone product or
          competing component library.
        </li>
        <li>Remove copyright or attribution notices in source files where present.</li>
        <li>
          Use the Service or its components to develop a directly competing
          product.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Infringe intellectual property or other rights of any party.</li>
        <li>Distribute malware, spam, or harassing content.</li>
        <li>
          Attempt to access accounts or data that aren&apos;t yours, or to
          circumvent tier or rate limits.
        </li>
        <li>Reverse engineer or scrape the Service except as permitted by law.</li>
      </ul>

      <h2>5. AI features (OdinAI)</h2>
      <p>
        Pro and Elite tiers include access to OdinAI, our agentic UI/UX assistant
        powered by third-party AI models. You are responsible for reviewing and
        validating AI-generated output before using it. AI usage is metered by
        token consumption against your plan&apos;s monthly quota. Excess usage may
        be billed at our then-current overage rate.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may suspend or terminate access for violation of these Terms. You may
        delete your account at any time. Sections that by their nature should
        survive termination (license restrictions, indemnity, disclaimers) will
        survive.
      </p>

      <h2>7. Disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
        WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, TO THE FULLEST EXTENT
        PERMITTED BY LAW.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, OUR AGGREGATE LIABILITY FOR ANY
        CLAIM ARISING FROM OR RELATED TO THE SERVICE IS LIMITED TO THE AMOUNTS
        YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR
        INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of the United States and the State
        of California, without regard to conflict-of-law rules. Disputes are
        subject to the exclusive jurisdiction of the state and federal courts
        located there.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms. Material changes will be announced via email
        and a banner notice on the site. Continued use after the effective date
        constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Legal questions can be sent to{" "}
        <a href="mailto:legal@mjolnirdesignstudios.com">
          legal@mjolnirdesignstudios.com
        </a>
        .
      </p>
    </>
  );
}
