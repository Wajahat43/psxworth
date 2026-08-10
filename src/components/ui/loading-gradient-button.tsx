"use client";

import { DotFlow } from "@/components/ui/dot-flow";
import GradientButton, {
  type GradientButtonProps,
} from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

const DEFAULT_LOADING_MESSAGES = [
  "Reading your paste",
  "Spotting buy & sell lines",
  "Matching PSX symbols",
  "Extracting dates & amounts",
  "Almost there",
];

const MESSAGE_INTERVAL_MS = 3200;

export interface LoadingGradientButtonProps
  extends GradientButtonProps {
  isLoading?: boolean;
  loadingLabel?: string;
  loadingMessages?: string[];
}

export function LoadingGradientButton({
  children,
  isLoading = false,
  loadingLabel,
  loadingMessages = DEFAULT_LOADING_MESSAGES,
  disabled = false,
  className,
  ...props
}: LoadingGradientButtonProps) {
  const isDisabled = disabled || isLoading;

  const messages = loadingLabel
    ? [loadingLabel, ...loadingMessages]
    : loadingMessages;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = window.setInterval(() => {
      setMessageIndex(
        (current) => (current + 1) % messages.length,
      );
    }, MESSAGE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isLoading, messages.length]);

  const activeMessage =
    messages[messageIndex] ?? messages[0];

  return (
    <GradientButton
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-live={isLoading ? "polite" : undefined}
      className={cn(
        isLoading && "shadow-lg shadow-cyan-500/20",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="relative flex w-full min-h-[1.5rem] flex-col items-center justify-center gap-2 py-0.5 sm:flex-row sm:gap-3">
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500/0 via-cyan-400/10 to-cyan-500/0"
            animate={{ x: ["-120%", "120%"] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <AnimatePresence mode="wait">
            <motion.span
              key={activeMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="relative z-10 max-w-[14rem] text-center text-sm font-medium leading-snug text-slate-100 sm:max-w-none sm:text-left"
            >
              {activeMessage}
            </motion.span>
          </AnimatePresence>

          <DotFlow className="relative z-10 shrink-0" />
        </span>
      ) : (
        children
      )}
    </GradientButton>
  );
}