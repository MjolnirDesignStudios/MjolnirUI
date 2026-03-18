"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Send,
  Bot,
  Calendar,
  Clock,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

const faqItems = [
  { label: "How do I upgrade my plan?", href: "#" },
  { label: "Can I use components commercially?", href: "#" },
  { label: "How does the Shader Engine work?", href: "#" },
  { label: "What payment methods are accepted?", href: "#" },
  { label: "How do I cancel my subscription?", href: "#" },
];

export default function SupportPage() {
  const { data: session } = useSession();

  // Form state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
    setSubject("");
    setMessage("");
    setCategory("general");
    setPriority("medium");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Get Support
        </h1>
        <p className="text-gray-400">
          Need help? Reach out and our team will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Contact Form */}
        <div className="lg:col-span-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Send size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-400 max-w-sm mb-6">
                Thank you for reaching out. We&apos;ll get back to you within 24
                hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-zinc-800 text-white text-sm font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-1">
                Contact Us
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Question</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC11]/50 focus:border-[#FFCC11]/50 transition resize-none"
                  placeholder="Describe your issue or question in detail..."
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-[#FFCC11] text-black font-bold rounded-xl hover:brightness-110 transition"
                >
                  <Send size={18} />
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Quick Help */}
        <div className="lg:col-span-2 space-y-5">
          {/* FAQ */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-gray-400" />
              Frequently Asked
            </h3>
            <ul className="space-y-2">
              {faqItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center justify-between text-sm text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition group"
                  >
                    {item.label}
                    <ChevronRight
                      size={14}
                      className="text-gray-600 group-hover:text-gray-400 transition"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* OdinAI Card */}
          <a
            href="/blocks/ai/odinai"
            className="block bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 hover:border-[#00f0ff]/30 transition group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center">
                <Bot size={20} className="text-[#00f0ff]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Chat with OdinAI
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Need immediate help? Our AI assistant can answer questions about
              components, subscriptions, and more.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-[#00f0ff] font-medium mt-3 group-hover:gap-2 transition-all">
              Launch OdinAI
              <ChevronRight size={12} />
            </span>
          </a>

          {/* Schedule a Call */}
          <a
            href="#"
            className="block bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 hover:border-[#FFCC11]/30 transition group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFCC11]/10 flex items-center justify-center">
                <Calendar size={20} className="text-[#FFCC11]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Schedule a Call
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Book a 1-on-1 session with our team via Calendly. Available for
              Pro and Elite members.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-[#FFCC11] font-medium mt-3 group-hover:gap-2 transition-all">
              Book a Time
              <ChevronRight size={12} />
            </span>
          </a>

          {/* Support Hours */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Clock size={20} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Support Hours</h3>
            </div>
            <div className="space-y-1.5 text-sm text-gray-400">
              <p>Monday - Friday: 9am - 6pm EST</p>
              <p>Saturday: 10am - 2pm EST</p>
              <p>Sunday: Closed</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Elite tier members receive 24/7 priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
