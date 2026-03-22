// app/components/Build.tsx — Founder's Kit / Startup Builder
"use client";
import React from "react";
import { Rocket, Zap, Globe, Bot, Coins, Box } from "lucide-react";
import ShimmerButton from "@/components/Buttons/ShimmerButton";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

export default function Build() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleViewBlocks = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/blocks/dashboard');
    } else {
      router.push('/blocks/dashboard');
    }
  };

  return (
    <section id="build" className="py-16 relative flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Build an Agentic AI{" "}
            <span className="text-gold">Startup Business!</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Power Your Startup with Premium Components — Click &apos;View Blocks&apos; for{" "}
            <span className="bg-linear-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent font-semibold">
              Freemiums!
            </span>
          </p>
        </motion.div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 lg:gap-4">

          {/* 1. Rocket — Large center with EnergyTunnel background */}
          <li className="md:[grid-area:1/4/3/10] lg:[grid-area:1/4/2.2/10]">
            <div className="relative h-full rounded-3xl border border-white/10 overflow-hidden isolate">
              <Image
                src="/Images/EnergyTunnel.jpeg"
                alt="Energy Tunnel"
                fill
                priority
                className="object-cover object-center scale-110"
              />
              <div className="absolute inset-0 bg-black/60" />
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/20 via-transparent to-transparent blur-3xl" />

              <div className="relative h-full p-8 md:p-12 flex flex-col items-center justify-center text-center gap-8 z-10">
                <div className="p-10 rounded-3xl bg-linear-to-br from-purple-800 to-blue-400 shadow-2xl">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl">
                    Build Your Startup!
                  </h3>
                  <p className="text-gold text-xl lg:text-2xl drop-shadow-lg">
                    From Idea to Launch!
                  </p>

                  <div onClick={handleViewBlocks} className="mt-10 inline-block cursor-pointer">
                    <ShimmerButton
                      title="View Blocks"
                      icon={<Box className="w-6 h-6 text-white" />}
                      otherClasses="mx-auto border border-gray-300/50 max-w-[260px] w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 2. AI Automation */}
          <li className="md:[grid-area:1/1/2/4] lg:[grid-area:1/1/1.5/4]">
            <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="p-8 rounded-3xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-2xl">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-white">AI Automation</h3>
                <p className="text-gold text-lg">Claude Code Workflows</p>
              </div>
            </div>
          </li>

          {/* 3. Design Systems */}
          <li className="md:[grid-area:1/10/2/13] lg:[grid-area:1/10/2/13]">
            <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="p-8 rounded-3xl bg-linear-to-br from-green-400 to-yellow-300 shadow-2xl">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white">Design Systems</h3>
                <p className="text-gold text-lg">Premium UI/UX Blocks</p>
              </div>
            </div>
          </li>

          {/* 4. Crypto Payments */}
          <li className="md:[grid-area:2/1/3/4] lg:[grid-area:2/1/3/4]">
            <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="p-8 rounded-3xl bg-linear-to-br from-yellow-300 to-orange-500 shadow-2xl">
                <Coins className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-white">Crypto Payments</h3>
                <p className="text-gold text-lg">Web3-Ready Checkout</p>
              </div>
            </div>
          </li>

          {/* 5. Deploy Globally */}
          <li className="md:[grid-area:2/10/3/13] lg:[grid-area:2/10/3/13]">
            <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="p-8 rounded-3xl bg-linear-to-br from-orange-400 to-red-700 shadow-2xl">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-white">Deploy Globally</h3>
                <p className="text-gold text-lg">Scale to Millions</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
