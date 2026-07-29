import type { Metadata, Viewport } from "next";
import { Gothic_A1, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/seo/JsonLd";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { organizationJsonLd } from "@/lib/seo/json-ld";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  THEME_COLOR,
  getSiteUrl,
} from "@/lib/seo/site";
import "./globals.css";

const gothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-gothic-a1",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "AI Collective",
    "AIC Seoul",
    "AI 커뮤니티",
    "서울 AI",
    "The AI Collective",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const lang = isLocale(raw) ? raw : defaultLocale;

  return (
    <html lang={lang}>
      <body className={`${gothicA1.variable} ${spaceGrotesk.variable} antialiased`}>
        <JsonLd data={organizationJsonLd()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
