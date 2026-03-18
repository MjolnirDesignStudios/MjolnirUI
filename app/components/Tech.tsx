// components/Tech.tsx — MJÖLNIR TECH SHOWCASE 2026
"use client";
import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Zap,
  Globe,
  Shield,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { TechCardGrid } from "@/components/ui/Cards/TechCardGrid";

// Counter component with animation
function Counter({ target, label, suffix = "", prefix = "", colorClass }: {
  target: number;
  label: string;
  suffix?: string;
  prefix?: string;
  colorClass?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      const timer = setInterval(() => {
        setCount(prev => {
          const next = prev + increment;
          if (next >= target) {
            clearInterval(timer);
            return target;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className={`text-4xl md:text-6xl font-black mb-2 ${colorClass || 'text-gold'}`}>
        {prefix}{Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div className="text-lg text-gray-400">{label}</div>
    </motion.div>
  );
}

// Hook to fetch subscriber count from Supabase
function useSubscribers() {
  const [count, setCount] = useState(10);
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const { count: subscriberCount, error } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true });
        if (!error && subscriberCount !== null) {
          setCount(subscriberCount);
        }
      } catch (error) {
        console.log('Using default subscriber count');
      }
    };
    fetchSubscribers();
  }, []);
  return count;
}

export default function Tech() {
  const subscriberCount = useSubscribers();

  return (
    <section id="tech" className="py-20 relative min-h-screen overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-5xl font-bold text-center mb-4">
            <span className="text-white">Asgardian </span><span className="text-gold">Tech</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Systems designed with a modern technology stack.
          </p>
        </motion.div>

        {/* Stats Grid — 4 electric colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="rounded-2xl border border-blue-400/30 p-6 bg-black/20 backdrop-blur-sm shadow-[0_0_28px_rgba(59,130,246,0.12)]">
            <Counter target={80} suffix="+" label="Components Forged" colorClass="text-blue-400" />
          </div>
          <div className="rounded-2xl border border-emerald-400/30 p-6 bg-black/20 backdrop-blur-sm shadow-[0_0_28px_rgba(52,211,153,0.12)]">
            <Counter target={1500} suffix="+" label="Site Visitors" colorClass="text-emerald-400" />
          </div>
          <div className="rounded-2xl border border-yellow-400/30 p-6 bg-black/20 backdrop-blur-sm shadow-[0_0_28px_rgba(234,179,8,0.12)]">
            <Counter target={subscriberCount} suffix="+" label="Newsletter Subscribers" colorClass="text-yellow-400" />
          </div>
          <div className="rounded-2xl border border-orange-400/30 p-6 bg-black/20 backdrop-blur-sm shadow-[0_0_28px_rgba(251,146,60,0.12)]">
            <Counter target={17} suffix="+" label="Users Served" colorClass="text-orange-400" />
          </div>
        </div>

        {/* Tech Flip Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <TechCardGrid />
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Performance",
              description: "Sub-millisecond load times with optimized animations and caching."
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              description: "Bank-grade encryption and compliance across all integrations."
            },
            {
              icon: TrendingUp,
              title: "Real-time Analytics",
              description: "Live data from Supabase for instant insights and monitoring."
            },
            {
              icon: Users,
              title: "Community Driven",
              description: "Built by developers, for developers, with open-source spirit."
            },
            {
              icon: Award,
              title: "Award Winning",
              description: "Recognized for innovation in modern web development."
            },
            {
              icon: Globe,
              title: "Global Scale",
              description: "Deployed worldwide with CDN optimization and edge computing."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-gold/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-yellow-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
