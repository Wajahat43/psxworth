"use client";

import { PWA_INSTALL_ACCEPTED } from "@/utils/posthog/events";
import { Download, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { toast } from "../molecules/Toast";
import { Button } from "../ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const INSTALLED_FLAG_KEY = "pwa_installed";

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return null;

    try {
      return window.localStorage.getItem(INSTALLED_FLAG_KEY) === "true" ? null : undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    const loadingTimeout = window.setTimeout(() => {
      setDeferredPrompt((currentPrompt) => (currentPrompt === undefined ? null : currentPrompt));
    }, 2500);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      // If we get this event, the app is installable again — clear the
      // installed flag so users can reinstall even if localStorage wasn't
      // cleared during uninstall.
      try {
        window.localStorage.removeItem(INSTALLED_FLAG_KEY);
      } catch {
        // ignore
      }
      setDeferredPrompt(event);
      window.clearTimeout(loadingTimeout);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      try {
        window.localStorage.setItem(INSTALLED_FLAG_KEY, "true");
      } catch {
        // ignore
      }
      window.clearTimeout(loadingTimeout);
      posthog.capture(PWA_INSTALL_ACCEPTED);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(loadingTimeout);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
    } catch (error) {
      toast({
        type: "error",
        title: "Error during PWA installation",
        description: error instanceof Error ? error.message : String(error),
      });
      posthog.captureException(
        new Error(`Error during PWA installation: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  };

  if (deferredPrompt === null) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="secondary"
      size="sm"
      className="px-2.5 py-1.5 rounded-md border border-border bg-secondary text-foreground hover:opacity-90 transition"
      title="Install our app for a better experience"
      disabled={deferredPrompt === undefined}
    >
      {deferredPrompt === undefined ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <Download className="h-4 w-4" />

      <span className="hidden md:inline">Install App</span>
    </Button>
  );
};

export default PWAInstallButton;
