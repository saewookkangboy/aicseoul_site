"use client";

import { motion, useReducedMotion } from "motion/react";

const softEase = [0.42, 0, 0.58, 1] as const;

/**
 * Subtle drifting spotlights for the home hero.
 * Respects prefers-reduced-motion with a static wash.
 */
export function HeroAmbient() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent 60%)",
        }}
        aria-hidden
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft base wash */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in srgb, var(--color-gold) 18%, transparent), transparent 65%)",
        }}
      />

      {/* Primary gold spotlight — slow diagonal drift */}
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[85vmax] w-[85vmax] rounded-full opacity-[0.38] blur-3xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in srgb, var(--color-gold) 42%, transparent) 0%, color-mix(in srgb, var(--color-cta) 12%, transparent) 38%, transparent 68%)",
        }}
        animate={{
          x: ["0%", "28%", "12%", "-8%", "0%"],
          y: ["0%", "18%", "32%", "10%", "0%"],
          scale: [1, 1.08, 0.96, 1.04, 1],
        }}
        transition={{
          duration: 32,
          ease: softEase,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Secondary warm spotlight — counter drift */}
      <motion.div
        className="absolute -right-[25%] top-[10%] h-[70vmax] w-[70vmax] rounded-full opacity-[0.28] blur-3xl will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in srgb, var(--color-cream) 16%, transparent) 0%, color-mix(in srgb, var(--color-gold) 22%, transparent) 35%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "-22%", "-8%", "14%", "0%"],
          y: ["0%", "12%", "-10%", "20%", "0%"],
          scale: [1, 0.94, 1.06, 0.98, 1],
        }}
        transition={{
          duration: 40,
          ease: softEase,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Soft shadow veil — slow opacity breathe + slight shift */}
      <motion.div
        className="absolute inset-[-10%] opacity-[0.45] mix-blend-soft-light will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 40% 60%, transparent 0%, color-mix(in srgb, var(--color-dark) 55%, transparent) 70%, color-mix(in srgb, var(--color-dark) 80%, transparent) 100%)",
        }}
        animate={{
          x: ["0%", "4%", "-3%", "0%"],
          y: ["0%", "-5%", "3%", "0%"],
          opacity: [0.35, 0.5, 0.4, 0.35],
        }}
        transition={{
          duration: 26,
          ease: softEase,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </div>
  );
}
