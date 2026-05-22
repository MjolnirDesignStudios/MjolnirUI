// app/components/Onboarding/onboardingConfig.ts
// Step definitions for the first-run onboarding tour. Each step is either a
// full-screen welcome modal (kind: "modal") or a popover anchored to a DOM
// element via [data-onboarding="<id>"] (kind: "popover").
//
// The tour fires once per user via a localStorage flag — see OnboardingFlow.
// To preview the tour again in dev, run in the console:
//   localStorage.removeItem("mjolnir-onboarding-completed")

export type OnboardingStep =
  | {
      id: string;
      kind: "modal";
      title: string;
      body: string;
      primaryCta: string;
      secondaryCta: string;
    }
  | {
      id: string;
      kind: "popover";
      /** CSS selector — usually `[data-onboarding="id"]` */
      anchor: string;
      /** Where to position the popover relative to the anchor */
      placement: "right" | "bottom" | "left" | "top";
      title: string;
      body: string;
    };

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    kind: "modal",
    title: "Welcome to MjolnirUI",
    body:
      "You're in the Asgardian Realm — a component library forged for builders. " +
      "Take a quick 30-second tour to see where everything lives, or jump straight in.",
    primaryCta: "Start tour",
    secondaryCta: "Skip for now",
  },
  {
    id: "browse-library",
    kind: "popover",
    anchor: '[data-onboarding="browse"]',
    placement: "right",
    title: "Browse the component library",
    body:
      "Every component lives here, organized by category. Free + Base tiers " +
      "get 5 unlocks; Pro unlocks the full library.",
  },
  {
    id: "studio-tools",
    kind: "popover",
    anchor: '[data-onboarding="background-studio"]',
    placement: "right",
    title: "Premium design tools",
    body:
      "The Background Studio, Particle Engine, and Shader Tool generate ready-" +
      "to-paste code for your project. Pro tier unlocks the full studio.",
  },
  {
    id: "billing",
    kind: "popover",
    anchor: '[data-onboarding="subscription"]',
    placement: "right",
    title: "Manage your subscription",
    body:
      "View what's next on your bill, update your card, or upgrade your plan. " +
      "Billing runs through Stripe — cancel anytime.",
  },
  {
    id: "docs",
    kind: "popover",
    anchor: '[data-onboarding="docs"]',
    placement: "right",
    title: "Docs & CLI",
    body:
      "Installation, copy-paste recipes, and the Mjolnir CLI live here. " +
      "You're all set — explore the realm.",
  },
];

export const ONBOARDING_FLAG_KEY = "mjolnir-onboarding-completed";
