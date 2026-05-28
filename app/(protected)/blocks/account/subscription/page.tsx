"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Zap, Crown, CreditCard, Loader2, ExternalLink,
  Calendar, AlertTriangle,
} from "lucide-react";
import { type TierName } from "@/lib/tierConfig";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import ElectricBorder from "@/components/ui/ElectricBorder";

interface SubscriptionDetails {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: number | null;
  amount: number;
  currency: string;
  interval: string;
  card_brand: string | null;
  card_last4: string | null;
}

interface TierFeature {
  text: string;
  comingSoon?: boolean;
}

const tiers: {
  name: string;
  tier: TierName;
  price: string;
  period: string;
  color: string;
  features: TierFeature[];
  /** Whole-tier coming-soon flag — disables 'Upgrade' button, shows badge. */
  comingSoonBadge?: string;
}[] = [
  {
    name: "Free",
    tier: "free",
    price: "$0",
    period: "forever",
    color: "#3B82F6",
    features: [
      { text: "Browse Component Library" },
      { text: "Preview All Tools" },
      { text: "Community Access" },
      { text: "5 Free + Base Components" },
      { text: "Design Token Reference" },
    ],
  },
  {
    name: "Base",
    tier: "base",
    price: "$10",
    period: "/month",
    color: "#10B981",
    features: [
      { text: "Full Component Library" },
      { text: "Background Studio" },
      { text: "Electric Effects" },
      { text: "Animated Orbs" },
      { text: "Email Support 24/7" },
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: "$25",
    period: "/month",
    color: "#EAB308",
    features: [
      { text: "Everything in Base" },
      { text: "Shader Engine" },
      { text: "Particle Engine" },
      { text: "3D Forge Pro", comingSoon: true },
      { text: "Commercial License" },
    ],
  },
  {
    name: "Elite",
    tier: "elite",
    price: "$50",
    period: "/month",
    color: "#F97316",
    features: [
      { text: "Everything in Pro" },
      { text: "OdinAI Design Agent", comingSoon: true },
      { text: "3D Forge Elite", comingSoon: true },
      { text: "Custom Development", comingSoon: true },
      { text: "Full Source Code Access", comingSoon: true },
    ],
    comingSoonBadge: "Coming Q3 2026",
  },
];

const tierOrder: Record<TierName, number> = { free: 0, base: 1, pro: 2, elite: 3 };

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || "free";
  const isPaid = userTier !== "free";

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch live billing details from Stripe for paid users — next billing
  // date, card on file, amount, status. Free users skip this entirely.
  useEffect(() => {
    if (!isPaid) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    setDetailsLoading(true);
    fetch("/api/stripe/subscription-details", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        setDetails(body.subscription ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setDetails(null);
      })
      .finally(() => {
        if (cancelled) return;
        setDetailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPaid]);

  /** Open the Stripe Billing Portal in the same tab. Paid users only. */
  const openBillingPortal = async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.url) {
        throw new Error(body.error || "Could not open billing portal");
      }
      window.location.href = body.url;
    } catch (e: unknown) {
      setPortalError(
        e instanceof Error ? e.message : "Could not open billing portal"
      );
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Your Subscription</h1>
          <p className="text-gray-400 flex items-center gap-2">
            You&apos;re currently on the <TierBadge tier={userTier} size="md" /> plan
          </p>
        </div>
        {/* Manage Billing — paid users only. Opens Stripe Customer Portal where
            they can update card, cancel, view invoices. */}
        {isPaid && (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold hover:border-[#FFCC11]/40 hover:text-[#FFCC11] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CreditCard size={14} />
              )}
              {portalLoading ? "Opening…" : "Manage Billing"}
              {!portalLoading && (
                <ExternalLink size={12} className="text-gray-500" />
              )}
            </button>
            {portalError && (
              <span className="text-[11px] text-amber-400 max-w-xs text-right">
                {portalError}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Billing details (paid users only) ─────────────── */}
      {isPaid && (
        <BillingDetailsCard
          loading={detailsLoading}
          details={details}
          onManageBilling={openBillingPortal}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {tiers.map((t) => {
          const isCurrent = t.tier === userTier;
          const isHigher = tierOrder[t.tier] > tierOrder[userTier];
          const isLower = tierOrder[t.tier] < tierOrder[userTier];
          const isLocked = Boolean(t.comingSoonBadge);

          const cardContent = (
            <div
              className="relative rounded-2xl border p-6 transition-all duration-300 flex flex-col h-full"
              style={{
                borderColor: isCurrent ? `${t.color}60` : "rgba(63,63,70,0.5)",
                boxShadow: isCurrent
                  ? `0 0 30px ${t.color}30, 0 0 60px ${t.color}15`
                  : "none",
                background: isCurrent
                  ? `linear-gradient(135deg, ${t.color}08 0%, #020617 50%, ${t.color}05 100%)`
                  : "linear-gradient(135deg, rgba(24,24,27,0.5) 0%, rgba(0,0,0,1) 100%)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />

              {/* Current Plan badge — inside card, top-right. When the tier
                  is locked (e.g. Elite Coming Q3 2026), show that badge in
                  the same slot. */}
              {isCurrent ? (
                <div className="flex justify-end pt-2 mb-1">
                  <div
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                  >
                    <Crown size={10} /> Current Plan
                  </div>
                </div>
              ) : isLocked ? (
                <div className="flex justify-end pt-2 mb-1">
                  <div
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                  >
                    {t.comingSoonBadge}
                  </div>
                </div>
              ) : (
                <div className="pt-2 mb-1 h-[26px]" />
              )}

              {/* Plan name + price */}
              <div className="mb-5">
                <h3 className="text-xl font-black text-white">{t.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">{t.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{t.period}</span>
                </div>
              </div>

              {/* Features — lightning bolt icons. Coming-soon items render
                  with a dim icon, gray text, and an inline "Soon" chip so
                  users see what is and isn't deliverable on launch day.
                  Each bullet is locked to 1 line via whitespace-nowrap +
                  truncate so narrow viewports don't break the card grid. */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {t.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-center gap-2 text-sm ${
                      f.comingSoon ? "text-gray-400" : "text-gray-300"
                    }`}
                  >
                    <Zap
                      size={14}
                      className="shrink-0"
                      style={{
                        color: f.comingSoon ? "#71717a" : t.color,
                        opacity: f.comingSoon ? 0.55 : 1,
                      }}
                    />
                    <span className="flex-1 whitespace-nowrap truncate">
                      {f.text}
                    </span>
                    {f.comingSoon && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0"
                        style={{
                          color: t.color,
                          borderColor: `${t.color}60`,
                          background: `${t.color}10`,
                        }}
                        title="This feature isn't ready yet — it ships post-launch."
                      >
                        Soon
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {isCurrent ? (
                <div
                  className="w-full py-3 rounded-xl text-center font-bold text-sm"
                  style={{ backgroundColor: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}
                >
                  Your Current Plan
                </div>
              ) : isLocked ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-bold text-sm text-gray-400 border border-zinc-700 bg-zinc-900/60 cursor-not-allowed"
                >
                  {t.comingSoonBadge}
                </button>
              ) : isHigher ? (
                <button
                  onClick={() => router.push("/#pricing")}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: t.color,
                    boxShadow: `0 4px 15px ${t.color}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 25px ${t.color}70, 0 0 40px ${t.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 15px ${t.color}40`;
                  }}
                >
                  <Zap size={14} /> Upgrade to {t.name}
                </button>
              ) : isLower ? (
                <button
                  className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 border border-zinc-800 bg-zinc-900/50 cursor-default"
                >
                  Included in Your Plan
                </button>
              ) : null}
            </div>
          );

          return isCurrent ? (
            <ElectricBorder key={t.tier} color={t.color} speed={2} chaos={0.18} borderRadius={16} className="relative h-full">
              {cardContent}
            </ElectricBorder>
          ) : (
            <div key={t.tier} className="relative h-full">
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500 pt-4 space-y-1">
        {isPaid ? (
          <>
            <p>
              Need to cancel, change card, or download an invoice?{" "}
              <button
                onClick={openBillingPortal}
                className="text-[#FFCC11] hover:text-[#FFD700] font-semibold transition"
              >
                Open Billing Portal
              </button>
            </p>
            <p className="text-[11px] text-gray-600">
              Anything else?{" "}
              <button
                onClick={() => router.push("/blocks/account/support")}
                className="underline hover:text-gray-400 transition"
              >
                Contact support
              </button>
            </p>
          </>
        ) : (
          <p>
            Questions about pricing?{" "}
            <button
              onClick={() => router.push("/blocks/account/support")}
              className="text-[#FFCC11] hover:text-[#FFD700] font-semibold transition"
            >
              Contact Support
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BILLING DETAILS CARD
   Shows the user exactly what they're paying for and when.
   Reads from GET /api/stripe/subscription-details.
   ═══════════════════════════════════════════════════════ */
function BillingDetailsCard({
  loading,
  details,
  onManageBilling,
}: {
  loading: boolean;
  details: SubscriptionDetails | null;
  onManageBilling: () => void;
}) {
  if (loading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-3 text-sm text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        Loading billing details…
      </div>
    );
  }

  if (!details) {
    // Paid tier in session but no Stripe sub on file — webhook hasn't caught
    // up yet, or the user is on a comped tier. Show a minimal helpful state.
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 text-sm text-gray-500">
        Billing details are syncing. If this doesn&apos;t update within a few
        minutes,{" "}
        <button
          onClick={onManageBilling}
          className="text-[#FFCC11] hover:text-[#FFD700] font-semibold transition"
        >
          open the billing portal
        </button>{" "}
        to verify your subscription.
      </div>
    );
  }

  const formatAmount = () => {
    const dollars = details.amount / 100;
    const symbol = details.currency === "USD" ? "$" : `${details.currency} `;
    return `${symbol}${dollars.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (ts: number | null) =>
    ts
      ? new Date(ts * 1000).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  const isPastDue =
    details.status === "past_due" || details.status === "unpaid";
  const isCanceling = details.cancel_at_period_end;

  return (
    <div
      className={`relative rounded-2xl border p-5 ${
        isPastDue
          ? "bg-red-500/5 border-red-500/30"
          : isCanceling
            ? "bg-amber-500/5 border-amber-500/30"
            : "bg-zinc-900/40 border-zinc-800/60"
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {(isPastDue || isCanceling) && (
            <div
              className={`flex items-center gap-1.5 mb-2 text-xs font-semibold ${
                isPastDue ? "text-red-300" : "text-amber-300"
              }`}
            >
              <AlertTriangle size={12} />
              {isPastDue
                ? "Payment past due — update your card to keep your plan."
                : `Your plan will cancel on ${formatDate(details.current_period_end)}.`}
            </div>
          )}

          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Current Billing
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Stat
              label={isCanceling ? "Access ends" : "Next billing"}
              icon={Calendar}
              value={formatDate(details.current_period_end)}
            />
            <Stat
              label="Amount"
              icon={Zap}
              value={`${formatAmount()} / ${details.interval}`}
            />
            <Stat
              label="Payment"
              icon={CreditCard}
              value={
                details.card_brand && details.card_last4
                  ? `${capitalize(details.card_brand)} •••• ${details.card_last4}`
                  : "—"
              }
            />
          </div>
        </div>

        <button
          onClick={onManageBilling}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-gray-300 hover:text-white hover:border-[#FFCC11]/40 transition shrink-0"
        >
          <CreditCard size={12} />
          Update
          <ExternalLink size={10} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
        <Icon size={11} />
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
