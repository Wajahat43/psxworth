"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

type Props = { message?: string; onRetry?: () => void };

export const UpcomingPayoutsError: React.FC<Props> = ({ message = "Failed to load upcoming payouts.", onRetry }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1 text-sm font-medium">{message}</div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-destructive/30 bg-background/30 px-2.5 py-1.5 text-sm font-medium text-destructive transition hover:bg-destructive/15"
          >
            Retry
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};

export default UpcomingPayoutsError;
