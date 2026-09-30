import type { Metadata, Viewport } from "next";
import { Oswald } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/content/site";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-oswald", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: BRAND.siteTitle,
  description: BRAND.description,
  openGraph: {
    title: BRAND.siteTitle,
    description: BRAND.description,
    type: "website",
    images: [{ url: "/images/product/balm-tin-window-light.jpg", alt: "Oak and Whiskey Beard Balm" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={oswald.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
