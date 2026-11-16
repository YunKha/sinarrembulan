import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// next/font: font di-host sendiri & di-preload, tanpa request ke Google Fonts dan tanpa layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

const DESCRIPTION =
  "PT. Sinar Rembulan Inotech - Perusahaan IT terkemuka yang menyediakan solusi software development, AI, IT infrastructure, dan digital transformation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PT. Sinar Rembulan Inotech - Innovative IT Solutions", template: "%s - PT. Sinar Rembulan Inotech" },
  description: DESCRIPTION,
  applicationName: "Sinar Rembulan Inotech",
  openGraph: {
    type: "website", locale: "id_ID", siteName: "PT. Sinar Rembulan Inotech",
    title: "PT. Sinar Rembulan Inotech", description: "Innovative IT Solutions For Smarter Future",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = { themeColor: "#0f172a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
