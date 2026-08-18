"use client";

// Error boundaries must be Client Components
import { ErrorState } from "@/components/molecules/ErrorState";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
          <ErrorState
            title="Application error"
            description="Something prevented the app from loading correctly."
            action={
              <Button onClick={reset} variant="destructive">
                Reload app
              </Button>
            }
          />
        </main>
      </body>
    </html>
  );
}
