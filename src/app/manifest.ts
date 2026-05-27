import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PsxWorth — Best Free PSX Portfolio Tracker Pakistan",
    short_name: "PsxWorth Free",
    description: "Free PSX stock portfolio tracker with no ads to track and manage your investments on any device",
    start_url: "/",
    orientation: "portrait",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    icons: [
      {
        src: "/pwa/icons/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icons/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/pwa/screenshots/screenshot1.png",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
      },
      {
        src: "/pwa/screenshots/screenshot2.png",
        sizes: "750x1334",
        type: "image/jpeg",
        form_factor: "narrow",
      },
    ],

    protocol_handlers: [
      {
        protocol: "web+stockworth",
        url: "/?stockdata=%s",
      },
    ],
    theme_color: "#0F182B",
    background_color: "#0F182B",
  };
}
