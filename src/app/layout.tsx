import QueryProvider from "@/components/QueryProvider";
import { ClearLastActivePortfolioOnSignOut } from "@/components/cookies/ClearLastActivePortfolioOnSignOut";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import PostHogAuth from "@/components/organisms/PostHogAuth";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.psxworth.com"),
  title: {
    default: "PsxWorth",
    template: "%s | PsxWorth",
  },
  description:
    "Pakistan's #1 free PSX portfolio tracker with zero ads. Track KSE100, manage Pakistan Stock Exchange investments, get prices & performance insights.",
  keywords: [
    "PSX portfolio tracker",
    "Pakistan Stock Exchange portfolio tracker",
    "free PSX stock tracker",
    "PSX portfolio tracker no ads",
    "KSE100 portfolio tracker",
    "real-time PSX updates",
    "PSX dividend tracker",
    "PSX performance analytics",
    "Pakistan stock market tracker",
    "investment portfolio tracker Pakistan",
    "best PSX tracker app Pakistan",
    "Investify alternative",
    "ZAR Sarmaya alternative",
    "PSX investment management",
    "free stock portfolio manager",
  ],
  openGraph: {
    title: "PsxWorth - Pakistan's Best Free PSX Portfolio Tracker (No Ads)",
    description:
      "Track your Pakistan Stock Exchange investments for FREE with zero advertisements. Portfolio analytics & performance insights.",
    images: [
      {
        url: "https://www.psxworth.com/pwa/screenshots/screenshot1.png",
        width: 1280,
        height: 720,
        alt: "PsxWorth free PSX portfolio tracker dashboard with real-time KSE100 data and performance analytics",
      },
    ],
    type: "website",
    url: "https://www.psxworth.com",
    siteName: "PsxWorth",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "PsxWorth - Best Free PSX Portfolio Tracker Pakistan | No Ads",
    description: "Pakistan's #1 free PSX portfolio tracker. Track KSE100, manage PSX investments with zero ads.",
    images: ["https://www.psxworth.com/pwa/screenshots/screenshot1.png"],
    creator: "@psxworth",
    site: "@psxworth",
  },
  applicationName: "PsxWorth",
  appleWebApp: {
    capable: true,
    title: "PsxWorth",
  },
  other: {
    category: "Finance",
    classification: "Portfolio Tracker",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1a202c",
  },
};

export const viewport: Viewport = {
  maximumScale: 1, //Prevents auto zoom on safari when font size is 14
  initialScale: 1,
  themeColor: "#1a202c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#6366f1", colorBackground: "#0F182B" },
      }}
    >
      <html lang="en" className="h-full w-full">
        <head>
          {/* JSON-LD structured data */}
          <Script
            id="organization-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "PsxWorth",
                url: "https://www.psxworth.com",
                logo: "https://www.psxworth.com/icon1.png",
                slogan: "The smartest and the simplest way to track your portfolio.",
              }),
            }}
          />
          <Script
            id="website-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "PsxWorth",
                url: "https://www.psxworth.com",
                description:
                  "PsxWorth is a PSX portfolio tracker focused on performance, weightage, and returns. The smartest and the simplest way to track your portfolio. AI transaction parsing lets you seamlessly import from any source - no other PSX tracker offers this.",
              }),
            }}
          />
          <Script
            id="webapp-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "PsxWorth",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Any",
                url: "https://www.psxworth.com",
                description:
                  "The smartest and the simplest way to track your portfolio. PSX portfolio tracker with performance, weightage, and returns. AI transaction parsing - import from any source; no other PSX tracker offers this.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  category: "Free",
                },
              }),
            }}
          />
          <link rel="manifest" href="/manifest.webmanifest" />
        </head>
        <body
          style={{
            scrollbarGutter: "stable",
            WebkitOverflowScrolling: "touch",
            overflowY: "scroll",
          }}
        >
          <QueryProvider>
            <PostHogAuth />
            <ClearLastActivePortfolioOnSignOut />
            <div className="min-h-screen w-full bg-slate-900 text-gray-100">
              <ConditionalLayout>{children}</ConditionalLayout>
            </div>
            <Toaster position="top-center" />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
