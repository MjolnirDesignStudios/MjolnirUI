// components/Footer.tsx — FINAL: 5 COLUMNS + LOGO BELOW SOCIALS
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { socialMedia, footerLinks } from "@/data";

export default function Footer() {
  return (
    <footer className="relative w-full py-20 bg-neutral-950 border-t border-white/10 overflow-hidden">
      {/* Footer Background Image */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Image
          src="/Images/footer-grid.svg"
          alt="Footer Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 justify-items-start mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6 text-left">
              <h3 className="text-2xl font-black text-white">{category}</h3>
              <ul className="space-y-3 list-none text-left">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-gold transition-colors duration-300 block text-lg"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        

        {/* SOCIAL + LOGO + COPYRIGHT */}
        <div className="flex flex-col items-center gap-10 pt-12 border-t border-white/10 mt-32">

        {/* Logo */}
          <Link href="/" className="shrink-0">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full opacity-0"
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.4 }}
                style={{
                  boxShadow: "0 0 80px #00f0ff, 0 0 160px #00f0ff",
                  background: "radial-gradient(circle, #00f0ff44, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              <Image
                src="/logos/mjolnir_logo_officialtransparent.png"
                alt="MjolnirUI"
                width={160}
                height={160}
                className="rounded-full drop-shadow-2xl relative z-10"
                priority
              />
            </motion.div>
          </Link>


          <div className="flex gap-4 lg:gap-6">
            {socialMedia.map((profile) => (
              <motion.a
                key={profile.id}
                href={profile.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 5,
                  boxShadow: "0 0 20px #FFD700, 0 0 40px #FFD700"
                }}
                className="w-12 h-12 lg:w-14 lg:h-14 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center hover:border-gold transition-all duration-300"
              >
                <Image src={profile.img} alt="" width={24} height={24} className="lg:w-7 lg:h-7" />
              </motion.a>
            ))}
          </div>


          {/* Copyright */}
          <div className="text-center">
            <p className="text-xl font-bold text-gold">Copyright © 2026 MjölnirUI and Mjölnir Design Studios</p>
            <p className="text-lg text-gray-400 mt-2">All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}