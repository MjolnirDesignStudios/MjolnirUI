export const metadata = {
  title: "Cookie Policy • MjolnirUI",
  description: "How MjolnirUI uses cookies and similar technologies.",
};

export default function CookiePolicy() {
  return (
    <>
      <h1 className="text-4xl font-black mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-05-01">May 1, 2026</time>
      </p>

      <p className="text-gray-300 leading-relaxed">
        This Cookie Policy explains how Mjolnir Design Studios LLC uses cookies
        and similar technologies on MjolnirUI. It supplements our{" "}
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What is a cookie?</h2>
      <p>
        A cookie is a small text file stored on your device by your browser when
        you visit a website. We also use related technologies such as
        localStorage to remember preferences (for example, your sidebar
        position) and session tokens.
      </p>

      <h2>2. Cookies we use</h2>
      <p>
        We keep our cookie usage minimal and limited to what makes the Service
        work. We do not use third-party advertising cookies.
      </p>

      <h3>Strictly necessary</h3>
      <ul>
        <li>
          <strong>Session token</strong> (NextAuth) — keeps you signed in. Set on
          login, expires on sign-out or after the session window ends. Without
          this cookie the app cannot function.
        </li>
        <li>
          <strong>CSRF token</strong> — prevents cross-site request forgery
          during sign-in.
        </li>
      </ul>

      <h3>Functional</h3>
      <ul>
        <li>
          <strong>Theme preference</strong> — remembers if you toggled to a
          non-default theme (defaults to dark).
        </li>
        <li>
          <strong>Sidebar position</strong> — remembers if you moved the
          dashboard sidebar to the right (stored in localStorage, not a cookie
          per se).
        </li>
      </ul>

      <h3>Analytics</h3>
      <p>
        We use first-party analytics to count page views and feature usage in
        aggregate. We do not track you across sites and we do not sell analytics
        data.
      </p>

      <h2>3. Your choices</h2>
      <p>
        You can clear cookies and localStorage at any time through your browser
        settings. Doing so will sign you out and reset preferences. Most browsers
        let you block all cookies, but please note that the Service requires
        strictly-necessary cookies to function.
      </p>

      <h2>4. Changes</h2>
      <p>
        We may update this Cookie Policy from time to time. Material changes
        will be announced via the methods described in our Privacy Policy.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions can be sent to{" "}
        <a href="mailto:privacy@mjolnirdesignstudios.com">
          privacy@mjolnirdesignstudios.com
        </a>
        .
      </p>
    </>
  );
}
