"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import React from "react";

type Props = { message?: string; onRetry?: () => void };

export const UpcomingPayoutsError: React.FC<Props> = ({ message = "Failed to load upcoming payouts.", onRetry }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-muted-foreground">{message}</div>
        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry} className="px-2.5 py-1.5 text-sm">
            Retry
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
};

export default UpcomingPayoutsError;
