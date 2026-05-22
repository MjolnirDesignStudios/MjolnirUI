export const metadata = {
  title: "Commercial License • MjolnirUI",
  description:
    "Commercial-use license terms for Pro and Elite MjolnirUI subscribers — what you can build, ship, and sell.",
};

export default function CommercialLicensePage() {
  return (
    <>
      <h1 className="text-4xl font-black mb-2">Commercial License</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-05-22">May 22, 2026</time>
      </p>

      <p className="text-gray-300 leading-relaxed">
        This Commercial License (the &ldquo;License&rdquo;) supplements the{" "}
        <a href="/legal/terms" className="text-[#FFCC11] hover:text-[#FFD700]">
          MjolnirUI Terms of Service
        </a>
        . It governs commercial use of the components, code snippets, shaders,
        templates, design tokens, icons, and any other artifacts (collectively,
        the &ldquo;Materials&rdquo;) provided through{" "}
        <strong>MjolnirUI Pro</strong> and{" "}
        <strong>MjolnirUI Elite</strong> subscriptions. By maintaining an active
        Pro or Elite subscription you accept these terms.
      </p>

      <h2>1. Who this license applies to</h2>
      <ul>
        <li>
          <strong>Pro subscribers</strong> — entitled to use the Materials in
          commercial projects under the conditions in §3.
        </li>
        <li>
          <strong>Elite subscribers</strong> — entitled to everything Pro
          subscribers receive, plus source-code-level access and the rights in
          §4 (once Elite is generally available).
        </li>
        <li>
          <strong>Free and Base subscribers</strong> — not entitled to the
          commercial-use rights described here. Free and Base usage remains
          governed by the Terms of Service and any per-asset notes.
        </li>
      </ul>

      <h2>2. Grant of license</h2>
      <p>
        Subject to your active, paid subscription and compliance with these
        terms, Mjolnir Design Studios LLC (&ldquo;we,&rdquo; &ldquo;us&rdquo;)
        grants you a worldwide, non-exclusive, non-transferable, royalty-free
        license to:
      </p>
      <ol>
        <li>
          Copy and modify the Materials to build digital products, websites,
          web applications, mobile applications, and design deliverables.
        </li>
        <li>
          Distribute the Materials as part of a compiled or bundled end product
          (e.g. a SaaS app, a marketing site, a client deliverable).
        </li>
        <li>
          Use the Materials in client work where you are the end developer or
          designer, provided the resulting product is for one named client
          project at a time.
        </li>
      </ol>

      <h2>3. Permitted uses</h2>
      <ul>
        <li>
          <strong>Internal applications</strong> — products built and used
          inside your organization.
        </li>
        <li>
          <strong>Commercial websites and apps</strong> — public-facing
          products built by you or your team, including SaaS applications,
          ecommerce stores, marketing sites, and dashboards.
        </li>
        <li>
          <strong>Client work</strong> — one named client per project.
          You may bill the client for design and development time; the
          subscription itself is yours and is not transferred to the client.
        </li>
        <li>
          <strong>Modifications</strong> — you may modify the Materials freely
          for use in your own products.
        </li>
      </ul>

      <h2>4. Source-code rights (Elite only)</h2>
      <p>
        When MjolnirUI Elite becomes generally available, Elite subscribers
        receive additional rights:
      </p>
      <ul>
        <li>
          Access to the unminified source of the MjolnirUI library and tooling.
        </li>
        <li>
          Permission to fork the source for internal use, subject to the
          prohibitions in §5.
        </li>
        <li>
          Right to request features and submit pull requests through the Elite
          private channel.
        </li>
      </ul>
      <p className="text-sm text-gray-400">
        Elite-tier rights activate the day your Elite subscription begins.
        Pro-tier rights are unaffected by Elite&rsquo;s availability.
      </p>

      <h2>5. Prohibited uses</h2>
      <p>The License does <strong>not</strong> permit you to:</p>
      <ul>
        <li>
          Repackage, resell, sublicense, or redistribute the Materials as a
          stand-alone component library, template marketplace, design system,
          or developer tool that competes with MjolnirUI.
        </li>
        <li>
          Distribute the Materials in source form to anyone who is not
          themselves a Pro or Elite subscriber, except as compiled output
          inside an end product.
        </li>
        <li>
          Remove or alter any copyright notice, attribution, or marking
          embedded in the Materials.
        </li>
        <li>
          Use the Materials to train, fine-tune, or evaluate machine-learning
          models intended for code or design generation, except for personal,
          non-commercial research.
        </li>
        <li>
          Use the Materials to operate a service whose primary purpose is to
          deliver the Materials themselves to third parties (e.g. a
          &ldquo;MjolnirUI clone&rdquo; subscription).
        </li>
      </ul>

      <h2>6. Active subscription requirement</h2>
      <p>
        The grant in §2 is active only while your subscription is in good
        standing. If your subscription lapses, is cancelled, or is downgraded
        below the entitling tier:
      </p>
      <ul>
        <li>
          <strong>Production code already shipped</strong> while your
          subscription was active continues to be licensed in place — you do
          not have to rip it out of products you&rsquo;ve already deployed.
        </li>
        <li>
          <strong>New work</strong> requires a reinstated subscription. You may
          not start new commercial projects using the Materials while
          unsubscribed.
        </li>
        <li>
          <strong>Updates and patches</strong> are available only while you
          subscribe. You retain whatever version of the Materials was most
          recently distributed to you.
        </li>
      </ul>

      <h2>7. Attribution</h2>
      <p>
        No public attribution is required in production deployments. We
        appreciate (but do not require) a mention or link back to{" "}
        <a
          href="https://mjolnirui.com"
          className="text-[#FFCC11] hover:text-[#FFD700]"
        >
          mjolnirui.com
        </a>
        .
      </p>

      <h2>8. Warranty disclaimer and liability</h2>
      <p>
        The Materials are provided &ldquo;as is.&rdquo; To the maximum extent
        permitted by law, we disclaim all warranties, express or implied,
        including merchantability, fitness for a particular purpose, and
        non-infringement. Our aggregate liability for any claim arising from
        the Materials is limited to the amount you paid us in the twelve months
        preceding the claim.
      </p>

      <h2>9. Changes to this license</h2>
      <p>
        We may update this License from time to time. Changes apply on a
        forward-going basis from the &ldquo;last updated&rdquo; date above.
        Your right to keep using Materials you have already shipped under prior
        versions of the License is preserved.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about the License?{" "}
        <a
          href="/contact"
          className="text-[#FFCC11] hover:text-[#FFD700]"
        >
          Reach out via our contact form
        </a>{" "}
        or email{" "}
        <a
          href="mailto:legal@mjolnirui.com"
          className="text-[#FFCC11] hover:text-[#FFD700]"
        >
          legal@mjolnirui.com
        </a>
        .
      </p>
    </>
  );
}
