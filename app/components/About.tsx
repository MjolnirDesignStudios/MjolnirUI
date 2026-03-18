// components/About.tsx — Placeholder About Section
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-yellow-600/20 rounded-xl flex items-center justify-center">
              <Hammer className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Forged in <span className="text-gold">Asgard</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MjolnirUI is the premium companion design system to{" "}
            <a
              href="https://mjolnirdesignstudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-400 hover:text-electric-300 transition-colors"
            >
              Mjolnir Design Studios
            </a>
            . A weapon to destroy... or a tool to build.
          </p>
          <p className="text-lg text-gray-500 mt-4 italic">
            &ldquo;Asgardian Tech Forged in Valhalla&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
