"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Palette,
  Code,
  Settings,
  LogOut,
  Zap,
  Crown,
} from "lucide-react";

// Sidebar Links for MjolnirUI - Base, Pro, Elite tiers
const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <User className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Design Studio",
    href: "/studio",
    icon: (
      <Palette className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Code Generator",
    href: "/generator",
    icon: (
      <Code className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Logout",
    href: "/logout",
    icon: (
      <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
];

export function Sidebar({ className }: { className?: string }) {
  const open = false;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen", // Changed from h-[60vh] to h-screen for full height
        className
      )}
    >
      <SidebarBody open={open} />
      <Dashboard />
    </div>
  );
}

export const SidebarBody = ({
  open,
}: {
  open: boolean;
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {open ? <MjolnirLogo /> : <MjolnirLogoIcon />}
        <div className="mt-8 flex flex-col gap-2">
          {sidebarLinks.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </div>
      <div className="mt-auto mb-4">
        <SidebarLink
          link={{
            label: "Mjolnir User",
            href: "/profile",
            icon: (
              <div className="h-7 w-7 shrink-0 rounded-full bg-linear-to-br from-electric-400 to-gold-400 flex items-center justify-center">
                <Zap className="h-4 w-4 text-black" />
              </div>
            ),
          }}
        />
        {/* Tier Indicator */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-center space-x-2 py-2 bg-linear-to-r from-electric-400/10 to-gold-400/10 rounded-lg border border-electric-400/20">
            <Crown className="h-4 w-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-400">PRO TIER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidebarLink = ({
  link,
}: {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
}) => {
  return (
    <Link
      href={link.href}
      className="group/sidebar py-2 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 rounded-lg mx-2"
    >
      <div className="flex items-center gap-3">
        {link.icon}
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover/sidebar:text-neutral-900 dark:group-hover/sidebar:text-neutral-100 transition-colors">
          {link.label}
        </span>
      </div>
    </Link>
  );
};

export const MjolnirLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-4 px-4 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-6 w-7 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-linear-to-br from-electric-400 to-gold-400 flex items-center justify-center">
        <Zap className="h-4 w-4 text-black" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-lg mjolnir-text-gradient whitespace-pre"
      >
        MjolnirUI
      </motion.span>
    </Link>
  );
};

export const MjolnirLogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-4 px-4 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-6 w-7 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-linear-to-br from-electric-400 to-gold-400 flex items-center justify-center">
        <Zap className="h-4 w-4 text-black" />
      </div>
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex gap-2">
          {[...new Array(4)].map((i, idx) => (
            <div
              key={"first-array-demo-1" + idx}
              className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            ></div>
          ))}
        </div>
        <div className="flex flex-1 gap-2">
          {[...new Array(2)].map((i, idx) => (
            <div
              key={"second-array-demo-1" + idx}
              className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hover-enabled Sidebar Component
export function HoverSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div
        className={cn(
          "relative z-10 flex h-full flex-col bg-black/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300",
          open ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="py-4 px-4">
              {open ? <MjolnirLogo /> : <MjolnirLogoIcon />}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <motion.div
                  key={idx}
                  className="px-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 py-3 px-3 hover:bg-white/10 transition-colors duration-200 rounded-lg"
                  >
                    {link.icon}
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{
                        opacity: open ? 1 : 0,
                        width: open ? "auto" : 0
                      }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium text-neutral-200 group-hover:text-white whitespace-nowrap overflow-hidden"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* User section at bottom */}
          <div className="mt-auto mb-4 px-2">
            <motion.div
              className="px-3 py-3 hover:bg-white/10 transition-colors duration-200 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-electric-400 to-gold-400 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-black" />
                </div>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: open ? 1 : 0,
                    width: open ? "auto" : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <div className="text-sm font-medium text-neutral-200">Mjolnir User</div>
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3 text-gold-400" />
                    <span className="text-xs text-gold-400">PRO</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-full w-full flex-1 flex-col gap-2 p-4">
          <div className="flex gap-2">
            {[...new Array(4)].map((i, idx) => (
              <div
                key={"main-content-1" + idx}
                className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              ></div>
            ))}
          </div>
          <div className="flex flex-1 gap-2">
            {[...new Array(2)].map((i, idx) => (
              <div
                key={"main-content-2" + idx}
                className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;