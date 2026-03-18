"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Bot, Calendar, Clock, BookOpen, HelpCircle, CheckCircle } from "lucide-react";

export default function SupportPage() {
  const { data: session } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Get Support</h1>
        <p className="text-gray-400">We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle size={48} className="text-[#FFCC11] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-400 max-w-sm">
                We&apos;ve received your request and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 cursor-pointer"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Question</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#FFCC11]/50 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC11]/50 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC11]/50 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFCC11] text-black font-bold hover:bg-[#FFD700] transition"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Quick Help Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* OdinAI */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFCC11]/20 flex items-center justify-center">
                <Bot size={20} className="text-[#FFCC11]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">OdinAI Assistant</h4>
                <p className="text-gray-500 text-xs">Instant answers 24/7</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Get instant help with common questions from our AI assistant.
            </p>
            <button className="w-full py-2.5 rounded-xl border border-[#FFCC11]/30 text-[#FFCC11] font-semibold text-sm hover:bg-[#FFCC11]/10 transition">
              Chat with OdinAI
            </button>
          </div>

          {/* Schedule a Call */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Schedule a Call</h4>
                <p className="text-gray-500 text-xs">Pro & Elite members</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Book a 1-on-1 session with our engineering team for complex issues.
            </p>
            <button className="w-full py-2.5 rounded-xl border border-blue-500/30 text-blue-400 font-semibold text-sm hover:bg-blue-500/10 transition">
              Book via Calendly
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <h4 className="text-white font-bold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { icon: BookOpen, label: "Documentation", href: "/blocks/docs" },
                { icon: HelpCircle, label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                    <link.icon size={14} /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Hours */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-gray-500" />
              <h4 className="text-white font-bold text-sm">Support Hours</h4>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Monday – Friday: 9am – 6pm EST</p>
              <p>Saturday: 10am – 2pm EST</p>
              <p className="text-gray-600">Sundays & Holidays: Closed</p>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              OdinAI is available 24/7 for immediate assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
