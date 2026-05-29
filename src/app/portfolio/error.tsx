"use client";

import { ErrorState } from "@/components/molecules/ErrorState";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <ErrorState
        title="Portfolio error"
        description={error.message || "Please try again later."}
        action={
          <Button onClick={reset} variant="destructive">
            Try again
          </Button>
        }
      />
    </div>
  );
}
