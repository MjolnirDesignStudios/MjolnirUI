"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { type TierName } from "@/lib/tierConfig";
import { Camera, Save, Send } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";

  // Form state
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");
  const [bio, setBio] = useState("");
  const [themePreference, setThemePreference] = useState<"dark" | "light" | "system">("dark");
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);
  const [notifyTips, setNotifyTips] = useState(true);

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    showToast("Profile saved successfully!");
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackMessage.trim()) return;
    setFeedbackSent(true);
    setFeedbackMessage("");
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  // Get user initials for avatar
  const initials = (session?.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600/90 text-white px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-500/50 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-400">
          Customize your MjolnirUI profile and preferences.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Avatar</h2>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl font-black text-white border-2 border-zinc-600">
              {initials}
            </div>
            <button className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div>
            <button className="px-4 py-2 bg-zinc-800 text-white text-sm font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition">
              Upload Avatar
            </button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white mb-2">
          Personal Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Contact support to change your email address.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Bio / About Me
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition resize-none"
            placeholder="Tell us about yourself (optional)"
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white">Preferences</h2>

        {/* Theme */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Theme Preference
          </h3>
          <div className="flex gap-4">
            {(["dark", "light", "system"] as const).map((theme) => (
              <label
                key={theme}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={themePreference === theme}
                  onChange={() => setThemePreference(theme)}
                  className="w-4 h-4 accent-[#FFCC11]"
                />
                <span className="text-sm text-gray-300 capitalize">
                  {theme}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Notification Toggles */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Notifications
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Product updates & releases",
                value: notifyUpdates,
                setter: setNotifyUpdates,
              },
              {
                label: "Newsletter & community highlights",
                value: notifyNewsletter,
                setter: setNotifyNewsletter,
              },
              {
                label: "Tips & tutorials",
                value: notifyTips,
                setter: setNotifyTips,
              },
            ].map((toggle) => (
              <label
                key={toggle.label}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm text-gray-400">{toggle.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggle.value}
                  onClick={() => toggle.setter(!toggle.value)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    toggle.value ? "bg-[#FFCC11]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      toggle.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFCC11] text-black font-bold rounded-xl hover:brightness-110 transition"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Feedback Section */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">
          Feedback & Feature Requests
        </h2>
        <p className="text-sm text-gray-400">
          Help us forge a better tool. Share your thoughts, report bugs, or
          request new features.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Category
          </label>
          <select
            value={feedbackCategory}
            onChange={(e) => setFeedbackCategory(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
          >
            <option value="general">General Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Your Feedback
          </label>
          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows={4}
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition resize-none"
            placeholder="Describe your feedback, bug, or feature request..."
          />
        </div>

        {feedbackSent && (
          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 text-sm text-emerald-400">
            Thank you for your feedback! We&apos;ll review it shortly.
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedbackMessage.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFCC11] text-black font-bold rounded-xl hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
