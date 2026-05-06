// app/docs/page.tsx
// Redirect /docs → /blocks/docs.
// Unsigned visitors hit the protected layout's auth wall and get redirected
// to /auth/signin?callbackUrl=/blocks/docs, which then drops them on the docs
// hub after sign-in. Signed-in visitors land directly on the docs.
import { redirect } from "next/navigation";

export const metadata = {
  title: "Documentation • MjolnirUI",
  description: "MjolnirUI documentation — installation, components, MCP, and more.",
};

export default function DocsRedirect() {
  redirect("/blocks/docs");
}
