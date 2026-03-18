"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Save, MessageSquare, CheckCircle } from "lucide-react";
import { type TierName } from "@/lib/tierConfig";
import { TierBadge } from "@/components/Dashboards/TierBadge";

export default function ProfilePage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  // Feedback
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [saved, setSaved] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFeedback = () => {
    if (!feedbackMessage.trim()) return;
    setFeedbackSent(true);
    setFeedbackMessage("");
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const initials = (session?.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Your Profile</h1>
        <p className="text-gray-400 flex items-center gap-2">
          Manage your account settings <TierBadge tier={userTier} size="sm" />
        </p>
      </div>

      {/* Avatar + Name */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl font-black text-white">
            {initials}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{session?.user?.name || "User"}</h3>
            <p className="text-gray-500 text-sm">{session?.user?.email}</p>
            <button className="mt-2 text-xs text-[#FFCC11] hover:text-[#FFD700] font-semibold transition">
              Upload Avatar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Display Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Contact support to change your email address</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Bio / About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC11]/50 transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Preferences</h3>

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-400 block mb-2">Theme</label>
          <div className="flex gap-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                  theme === t
                    ? "bg-[#FFCC11]/20 text-[#FFCC11] border border-[#FFCC11]/40"
                    : "bg-zinc-800 text-gray-400 border border-zinc-700 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 block">Notifications</label>
          {[
            { label: "Product updates & new components", value: notifyUpdates, setter: setNotifyUpdates },
            { label: "Newsletter & community highlights", value: notifyNewsletter, setter: setNotifyNewsletter },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{item.label}</span>
              <button
                onClick={() => item.setter(!item.value)}
                className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? "bg-[#FFCC11]" : "bg-zinc-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${item.value ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold hover:bg-[#FFD700] transition"
      >
        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
      </button>

      {/* Feedback */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <MessageSquare size={18} /> Feedback & Feature Requests
        </h3>
        <p className="text-gray-500 text-sm mb-4">Help us improve MjolnirUI</p>

        <div className="space-y-3">
          <select
            value={feedbackCategory}
            onChange={(e) => setFeedbackCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 cursor-pointer"
          >
            <option value="general">General Feedback</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
          </select>

          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="What would you like to see in MjolnirUI?"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC11]/50 transition resize-none"
          />

          <button
            onClick={handleFeedback}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-sm hover:bg-zinc-700 transition"
          >
            {feedbackSent ? "Thanks for your feedback!" : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
