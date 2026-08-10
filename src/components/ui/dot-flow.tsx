"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const PARTICLES = [
  { delay: 0, duration: 2.0, yOffset: 0, scale: 1.0, blur: 8 },
  { delay: 0.3, duration: 2.2, yOffset: 0, scale: 0.9, blur: 7 },
  { delay: 0.6, duration: 1.9, yOffset: 0, scale: 0.85, blur: 6 },

  { delay: 0.15, duration: 2.4, yOffset: -8, scale: 0.7, blur: 5 },
  { delay: 0.8, duration: 2.1, yOffset: -8, scale: 0.65, blur: 4 },

  { delay: 0.45, duration: 2.3, yOffset: 8, scale: 0.75, blur: 5 },
  { delay: 1.0, duration: 2.0, yOffset: 8, scale: 0.7, blur: 4 },
];

const GLOW_PULSES = [
  { delay: 0, duration: 2.5, spread: 16 },
  { delay: 0.8, duration: 3.2, spread: 24 },
  { delay: 1.6, duration: 2.8, spread: 20 },
];

export function DotFlow({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-6 w-16 items-center justify-center", className)} aria-hidden>
      {GLOW_PULSES.map((pulse, i) => (
        <motion.span
          key={`glow-${i}`}
          className="pointer-events-none absolute inset-0 rounded-full bg-cyan-500/10"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: pulse.duration,
            delay: pulse.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            filter: `blur(${pulse.spread}px)`,
          }}
        />
      ))}

      <motion.span
        className="absolute inset-x-2 inset-y-2 rounded-full bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"
        animate={{
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {PARTICLES.map((particle, i) => (
        <motion.span
          key={`particle-${i}`}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: particle.scale * 8,
            height: particle.scale * 8,
            filter: `blur(${particle.blur}px)`,
            boxShadow: `0 0 ${particle.blur * 2}px rgba(34,211,238,0.7)`,
          }}
          animate={{
            x: [-28, 28],
            y: [particle.yOffset, particle.yOffset + Math.sin(i) * 2],
            opacity: [0, 0.4, 1, 0.4, 0],
            scale: [0.5, particle.scale, particle.scale, particle.scale, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {[...Array(4)].map((_, i) => (
        <motion.span
          key={`micro-${i}`}
          className="absolute w-1 h-1 rounded-full bg-blue-300/60"
          animate={{
            x: [-24, 24],
            y: [Math.sin(i * 2) * 6, Math.cos(i * 2) * 6],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1.8 + i * 0.3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <motion.span
        className="absolute w-2 h-2 rounded-full bg-cyan-300"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: "0 0 12px rgba(34,211,238,0.9)",
        }}
      />
    </span>
  );
}
