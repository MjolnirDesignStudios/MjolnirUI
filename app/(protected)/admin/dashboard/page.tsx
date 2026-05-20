// app/(protected)/admin/dashboard/page.tsx
// Admin dashboard — Day 3 MVP.
// Watered-down version of the MDS admin: KPIs, tier distribution donut,
// recent users table with row drawer, recent saves list, quick actions.
// Stripe MRR + click analytics arrive in Day 4.
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CreditCard, Sparkles, DollarSign, TrendingUp,
  RefreshCw, Search, Crown, Shield, X, Save, Loader2,
  Palette, Type as TypeIcon, Layers, Image as ImageIcon,
  Activity, Flame,
} from "lucide-react";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { TIER_CONFIG, type TierName } from "@/lib/tierConfig";

/* ═══════════════════════════════════════════════════════
   TYPES (mirror API responses)
   ═══════════════════════════════════════════════════════ */
interface Stats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  totalSaves: number;
  mrrCents: number;
  conversionPct: number;
  tierBreakdown: Record<string, number>;
  savesByType: Record<string, number>;
}

interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  tier: string | null;
  role: string | null;
  created_at: string | null;
}

interface RecentSave {
  id: string;
  asset_type: string;
  name: string;
  created_at: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
}

interface PopularTool {
  tool: string;
  label: string;
  opens: number;
  unique_users: number;
}

interface ActivityDay {
  date: string;
  page_view: number;
  tool_open: number;
  component_click: number;
  save_asset: number;
  export_action: number;
  upgrade_click: number;
  total: number;
}

interface MrrData {
  mrr_cents: number;
  arr_cents: number;
  active_subscriptions: number;
  currency: string;
  source: "stripe" | "estimate";
  note?: string;
}

const ASSET_TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  color_palette: { label: "Palette", icon: Palette },
  type_system: { label: "Type system", icon: TypeIcon },
  token_set: { label: "Token set", icon: Layers },
  icon: { label: "Icon", icon: ImageIcon },
};

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recentSaves, setRecentSaves] = useState<RecentSave[]>([]);
  const [popularTools, setPopularTools] = useState<PopularTool[]>([]);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [mrr, setMrr] = useState<MrrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      // Fan out all reads in parallel; tolerate partial failure.
      const [statsRes, usersRes, savesRes, toolsRes, actRes, mrrRes] =
        await Promise.all([
          fetch("/api/admin/stats", { cache: "no-store" }),
          fetch("/api/admin/users?limit=50", { cache: "no-store" }),
          fetch("/api/admin/recent-saves?limit=10", { cache: "no-store" }),
          fetch("/api/admin/analytics/popular-tools?days=30", { cache: "no-store" }),
          fetch("/api/admin/analytics/activity?days=30", { cache: "no-store" }),
          fetch("/api/admin/mrr", { cache: "no-store" }),
        ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (savesRes.ok) setRecentSaves((await savesRes.json()).recentSaves || []);
      if (toolsRes.ok) setPopularTools((await toolsRes.json()).tools || []);
      if (actRes.ok) setActivity((await actRes.json()).series || []);
      if (mrrRes.ok) setMrr(await mrrRes.json());

      if (!statsRes.ok && !usersRes.ok) {
        setErr("Failed to load dashboard data");
      }
    } catch {
      setErr("Network error loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.tier?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-linear-to-r from-white via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            Revenue, users, and activity across MjolnirUI. Stripe MRR + click
            analytics arrive in the Day 4 build.
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-gray-300 hover:text-white hover:border-zinc-600 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-200">
          {err}
        </div>
      )}

      {/* ── KPI strip ───────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            icon={Users}
            label="Total users"
            value={stats?.totalUsers}
            color="#3B82F6"
            loading={loading}
          />
          <KpiCard
            icon={CreditCard}
            label="Paid users"
            value={stats?.paidUsers}
            color="#10B981"
            loading={loading}
          />
          <KpiCard
            icon={Sparkles}
            label="Total saves"
            value={stats?.totalSaves}
            color="#FFCC11"
            loading={loading}
          />
          <KpiCard
            icon={DollarSign}
            label={mrr?.source === "stripe" ? "MRR (Stripe)" : "MRR (est.)"}
            value={
              mrr
                ? `$${(mrr.mrr_cents / 100).toLocaleString()}`
                : stats
                  ? `$${(stats.mrrCents / 100).toLocaleString()}`
                  : undefined
            }
            color="#F97316"
            loading={loading}
            sub={
              mrr?.source === "stripe"
                ? `${mrr.active_subscriptions} active subs · ARR $${(mrr.arr_cents / 100).toLocaleString()}`
                : "from tier counts (Stripe key not set)"
            }
          />
          <KpiCard
            icon={TrendingUp}
            label="Free → Paid"
            value={stats !== null ? `${stats.conversionPct}%` : undefined}
            color="#00F0FF"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Tier distribution + saves by type ───────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TierDistributionCard breakdown={stats?.tierBreakdown} loading={loading} />
        <SavesByTypeCard byType={stats?.savesByType} total={stats?.totalSaves} loading={loading} />
      </section>

      {/* ── Activity timeline + Popular tools ───────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityTimelineCard series={activity} loading={loading} />
        </div>
        <PopularToolsCard tools={popularTools} loading={loading} />
      </section>

      {/* ── Recent users table ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Recent Users
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-[#FFCC11]/40 transition">
            <Search size={14} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, tier…"
              className="bg-transparent text-sm text-white outline-none w-40 sm:w-64"
            />
          </div>
        </div>
        <UsersTable
          users={filteredUsers}
          loading={loading}
          onSelect={setActiveUser}
        />
      </section>

      {/* ── Recent saves ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Recent saves
        </h2>
        <RecentSavesList saves={recentSaves} loading={loading} />
      </section>

      {/* ── User detail drawer ──────────────────────────── */}
      <AnimatePresence>
        {activeUser && (
          <UserDetailDrawer
            user={activeUser}
            onClose={() => setActiveUser(null)}
            onUpdated={(u) => {
              setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...u } : x)));
              setActiveUser({ ...activeUser, ...u });
              loadAll();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════ */
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number | undefined;
  color: string;
  loading: boolean;
  sub?: string;
}) {
  return (
    <div
      className="bg-linear-to-br from-zinc-900 to-black border rounded-2xl p-4 transition"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">
          {label}
        </span>
      </div>
      <div className="text-2xl font-black text-white tabular-nums">
        {loading ? <span className="opacity-30">—</span> : value ?? "—"}
      </div>
      {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TIER DISTRIBUTION (CSS donut, no chart lib)
   ═══════════════════════════════════════════════════════ */
function TierDistributionCard({
  breakdown,
  loading,
}: {
  breakdown?: Record<string, number>;
  loading: boolean;
}) {
  const total = breakdown
    ? Object.values(breakdown).reduce((sum, n) => sum + n, 0)
    : 0;

  // Build a conic-gradient from tier counts in the order free → base → pro → elite
  const order: TierName[] = ["free", "base", "pro", "elite"];
  let runningPct = 0;
  const segments: { tier: TierName; from: number; to: number; color: string }[] = [];
  for (const t of order) {
    const count = breakdown?.[t] ?? 0;
    const pct = total > 0 ? (count / total) * 100 : 0;
    if (pct > 0) {
      segments.push({
        tier: t,
        from: runningPct,
        to: runningPct + pct,
        color: TIER_CONFIG[t].color,
      });
      runningPct += pct;
    }
  }
  const conic =
    segments.length > 0
      ? `conic-gradient(${segments
          .map((s) => `${s.color} ${s.from}% ${s.to}%`)
          .join(", ")})`
      : "conic-gradient(#3f3f46 0% 100%)";

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-3">Tier distribution</h3>
      <div className="flex items-center gap-5 flex-wrap">
        <div
          className="relative w-32 h-32 rounded-full shrink-0"
          style={{ background: conic }}
        >
          {/* donut hole */}
          <div className="absolute inset-3 rounded-full bg-zinc-900 border border-zinc-800/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-black text-white tabular-nums">
                {loading ? "—" : total}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500">users</div>
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="flex-1 min-w-[160px] space-y-2">
          {order.map((t) => {
            const count = breakdown?.[t] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={t} className="flex items-center gap-3 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: TIER_CONFIG[t].color }}
                />
                <span className="text-gray-300 capitalize w-12">{t}</span>
                <span className="font-mono text-white tabular-nums w-10 text-right">{count}</span>
                <span className="font-mono text-gray-500 tabular-nums w-12 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SAVES BY TYPE
   ═══════════════════════════════════════════════════════ */
function SavesByTypeCard({
  byType,
  total,
  loading,
}: {
  byType?: Record<string, number>;
  total?: number;
  loading: boolean;
}) {
  const types = Object.keys(ASSET_TYPE_META);
  const max = byType ? Math.max(...Object.values(byType), 1) : 1;
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between gap-2">
        <span>Saves by asset type</span>
        <span className="text-xs font-normal text-gray-500">
          {loading ? "" : `${total ?? 0} total`}
        </span>
      </h3>
      <div className="space-y-3">
        {types.map((t) => {
          const meta = ASSET_TYPE_META[t];
          const Icon = meta.icon;
          const count = byType?.[t] ?? 0;
          const widthPct = (count / max) * 100;
          return (
            <div key={t}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-xs text-gray-300">
                  <Icon size={13} className="text-[#FFCC11]" />
                  {meta.label}
                </span>
                <span className="text-xs font-mono text-white tabular-nums">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#FFCC11] to-[#00f0ff]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   USERS TABLE
   ═══════════════════════════════════════════════════════ */
function UsersTable({
  users,
  loading,
  onSelect,
}: {
  users: AdminUser[];
  loading: boolean;
  onSelect: (u: AdminUser) => void;
}) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Name</th>
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Tier</th>
              <th className="px-4 py-2.5 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No users match.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelect(u)}
                  className="cursor-pointer hover:bg-white/5 transition"
                >
                  <td className="px-4 py-2.5 text-white">{u.name || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-300">{u.email || "—"}</td>
                  <td className="px-4 py-2.5">
                    <TierBadge tier={(u.tier as TierName) || "free"} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 text-[#FFCC11]">
                        <Shield size={11} />
                        admin
                      </span>
                    ) : (
                      <span className="text-gray-500">user</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RECENT SAVES LIST
   ═══════════════════════════════════════════════════════ */
function RecentSavesList({
  saves,
  loading,
}: {
  saves: RecentSave[];
  loading: boolean;
}) {
  if (loading && saves.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 text-center text-sm text-gray-500">
        Loading recent saves…
      </div>
    );
  }
  if (saves.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-sm text-gray-500">
        No saves yet. Once users save palettes / type systems / tokens / icons, they show up here.
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {saves.map((s) => {
        const meta = ASSET_TYPE_META[s.asset_type];
        const Icon = meta?.icon ?? Sparkles;
        return (
          <div
            key={s.id}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 hover:border-zinc-700 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFCC11]/10 border border-[#FFCC11]/20 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-[#FFCC11]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white truncate">{s.name}</div>
              <div className="text-[10px] text-gray-500 truncate">
                {meta?.label ?? s.asset_type} · {s.user_email || s.user_name || "unknown user"}
              </div>
            </div>
            <div className="text-[10px] font-mono text-gray-500 shrink-0">
              {new Date(s.created_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   USER DETAIL DRAWER
   Tier dropdown + role toggle + save → PATCH /api/admin/users/:id
   ═══════════════════════════════════════════════════════ */
function UserDetailDrawer({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (u: AdminUser) => void;
}) {
  const [tier, setTier] = useState<TierName>((user.tier as TierName) || "free");
  const [role, setRole] = useState<string>(user.role || "user");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty = tier !== user.tier || role !== user.role;

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, role }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMsg({ kind: "err", text: body.error || "Failed to save" });
      } else {
        setMsg({ kind: "ok", text: "Saved" });
        onUpdated(body.user);
      }
    } catch {
      setMsg({ kind: "err", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] flex flex-col bg-zinc-950 border-l border-zinc-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              User
            </div>
            <div className="text-base font-bold text-white truncate">
              {user.name || user.email || "Unknown"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-white transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Identity */}
          <div className="bg-black/40 border border-zinc-800/60 rounded-xl p-4 space-y-2">
            <Field label="Email" value={user.email || "—"} />
            <Field label="Name" value={user.name || "—"} />
            <Field label="User ID" value={user.id} mono />
          </div>

          {/* Tier */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as TierName)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition"
            >
              {(["free", "base", "pro", "elite"] as TierName[]).map((t) => (
                <option key={t} value={t}>
                  {TIER_CONFIG[t].label} ({t})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <RoleButton
                active={role === "user"}
                onClick={() => setRole("user")}
                icon={Crown}
                label="User"
              />
              <RoleButton
                active={role === "admin"}
                onClick={() => setRole("admin")}
                icon={Shield}
                label="Admin"
              />
            </div>
          </div>

          {/* Save action */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FFCC11] text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "No changes"}
            </button>
            {msg && (
              <span
                className={`text-xs ${msg.kind === "ok" ? "text-[#10B981]" : "text-amber-400"}`}
              >
                {msg.text}
              </span>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span
        className={`text-xs ${mono ? "font-mono text-gray-400" : "text-gray-200"} truncate text-right min-w-0`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition ${
        active
          ? "bg-[#FFCC11]/15 border-[#FFCC11]/40 text-[#FFCC11]"
          : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   POPULAR TOOLS CARD
   ═══════════════════════════════════════════════════════ */
function PopularToolsCard({
  tools,
  loading,
}: {
  tools: PopularTool[];
  loading: boolean;
}) {
  const max = tools.length > 0 ? Math.max(...tools.map((t) => t.opens), 1) : 1;
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          Popular tools
        </span>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
          last 30d
        </span>
      </h3>
      {loading && tools.length === 0 ? (
        <div className="text-xs text-gray-500 py-4 text-center">Loading…</div>
      ) : tools.length === 0 ? (
        <div className="text-xs text-gray-500 py-4 text-center">
          No tool opens yet. Once users navigate the studios, this fills up.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tools.slice(0, 8).map((t) => {
            const widthPct = (t.opens / max) * 100;
            return (
              <div key={t.tool}>
                <div className="flex items-baseline justify-between mb-1 gap-2">
                  <span className="text-xs text-gray-300 truncate">{t.label}</span>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0">
                    {t.opens.toLocaleString()} opens · {t.unique_users} users
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-orange-400 to-[#FFCC11]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACTIVITY TIMELINE CARD
   Daily event totals as a CSS sparkline-style bar chart.
   ═══════════════════════════════════════════════════════ */
function ActivityTimelineCard({
  series,
  loading,
}: {
  series: ActivityDay[];
  loading: boolean;
}) {
  const max = series.length > 0 ? Math.max(...series.map((d) => d.total), 1) : 1;
  const totalEvents = series.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-2">
          <Activity size={14} className="text-[#00f0ff]" />
          Activity (events / day)
        </span>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
          {totalEvents.toLocaleString()} events · 30d
        </span>
      </h3>
      {loading && series.length === 0 ? (
        <div className="text-xs text-gray-500 py-8 text-center">Loading…</div>
      ) : series.length === 0 ? (
        <div className="text-xs text-gray-500 py-8 text-center">No activity yet.</div>
      ) : (
        <>
          <div
            className="flex items-end gap-px h-32 px-1"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "100% 25%",
            }}
          >
            {series.map((d) => {
              const heightPct = (d.total / max) * 100;
              const isWeekend = [0, 6].includes(new Date(d.date).getUTCDay());
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col justify-end group relative"
                  title={`${d.date}: ${d.total} events`}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isWeekend
                        ? "bg-[#00f0ff]/40 hover:bg-[#00f0ff]/70"
                        : "bg-[#00f0ff]/70 hover:bg-[#00f0ff]"
                    }`}
                    style={{
                      height: d.total === 0 ? "1px" : `${Math.max(heightPct, 2)}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-gray-500">
            <span>{series[0]?.date}</span>
            <span>{series[series.length - 1]?.date}</span>
          </div>
        </>
      )}
    </div>
  );
}
