import { ErrorState } from "@/components/molecules/ErrorState";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Blocked() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <ErrorState
        title="Access temporarily blocked"
        description="You have been rate limited. Please try again after some time."
        action={
          <Button asChild>
            <Link href="/portfolio">Back to portfolio</Link>
          </Button>
        }
      />
    </div>
  );
}
