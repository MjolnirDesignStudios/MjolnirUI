"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navigation/Navbar';
import Navbar_V0 from './Navigation/Navbar_V0';
import Navbar_V1 from './Navigation/Navbar_V1';
import { FloatingNav } from './Navigation/FloatingNav';
import { HoverSidebar } from './Navigation/Sidebar';

export default function NavbarShowcase() {
  const [activeNavbar, setActiveNavbar] = useState('current');
  const [showSidebar, setShowSidebar] = useState(false);

  const navbarOptions = [
    { id: 'current', name: 'Current Navbar', component: Navbar },
    { id: 'v0', name: 'Navbar V0 (Enhanced)', component: Navbar_V0 },
    { id: 'v1', name: 'Navbar V1', component: Navbar_V1 },
  ];

  const ActiveNavbar = navbarOptions.find(nav => nav.id === activeNavbar)?.component || Navbar;

  return (
    <div className="min-h-screen bg-linear-to-br from-storm-900 via-black to-storm-950">
      {/* Navbar Showcase Controls */}
      <div className="fixed top-20 left-4 z-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-4">
        <h3 className="text-white font-bold mb-3">Navbar Showcase</h3>
        <div className="space-y-2">
          {navbarOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveNavbar(option.id)}
              className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeNavbar === option.id
                  ? 'bg-electric-400/20 text-electric-400 border border-electric-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              showSidebar
                ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {showSidebar ? 'Hide' : 'Show'} Sidebar
          </button>
        </div>
      </div>

      {/* Active Navbar */}
      <ActiveNavbar />

      {/* Mobile Navigation (always visible for testing) */}
      <FloatingNav />

      {/* Sidebar (conditionally rendered) */}
      {showSidebar && (
        <div className="fixed inset-0 z-30">
          <HoverSidebar />
        </div>
      )}

      {/* Content */}
      <div className="pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black mb-6">
              <span className="mjolnir-text-gradient">MjolnirUI</span>
              <br />
              <span className="text-white">Navigation Showcase</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Test and compare different navbar designs for your landing site.
              Each variation is optimized for the MjolnirUI aesthetic with cyberpunk-inspired styling.
            </p>
          </motion.div>

          {/* Feature sections for scrolling */}
          <div className="space-y-32">
            {['About', 'Blocks', 'HammrAI', 'Pricing', 'Tech'].map((section, index) => (
              <motion.section
                key={section}
                id={section.toLowerCase()}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="min-h-screen flex items-center justify-center"
              >
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-4 text-white">{section}</h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    This is the {section} section. Scroll to test navbar behavior and visibility changes.
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                        <div className="w-full h-32 bg-linear-to-br from-electric-400/20 to-gold-400/20 rounded-lg mb-4"></div>
                        <h3 className="text-white font-semibold mb-2">Feature {i + 1}</h3>
                        <p className="text-gray-400 text-sm">Description of feature {i + 1} in the {section} section.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}