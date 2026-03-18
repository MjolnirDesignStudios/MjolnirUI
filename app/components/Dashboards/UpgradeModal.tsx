// components/Dashboards/UpgradeModal.tsx
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import { getTierConfig, type TierName } from "@/lib/tierConfig";
import { TierBadge } from "./TierBadge";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: TierName;
  featureName: string;
}

export function UpgradeModal({ isOpen, onClose, requiredTier, featureName }: UpgradeModalProps) {
  const config = getTierConfig(requiredTier);
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full mx-4 bg-black/80 backdrop-blur-xl border rounded-2xl p-8"
            style={{ borderColor: `${config.color}40` }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Zap size={32} style={{ color: config.color }} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Unlock {featureName}
              </h3>

              <p className="text-gray-400 mb-6">
                This feature requires{" "}
                <TierBadge tier={requiredTier} size="sm" /> or higher.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onClose();
                  router.push("/#pricing");
                }}
                className="w-full py-3 rounded-xl font-bold text-black text-lg"
                style={{ backgroundColor: config.color }}
              >
                Upgrade to {config.label}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
