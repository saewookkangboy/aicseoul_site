import type { Metadata } from "next";
import { Gothic_A1, Space_Grotesk } from "next/font/google";
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

const siteUrl = process.env.AUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Collective Seoul",
    template: "%s · AI Collective Seoul",
  },
  description: "AI 시대를 혼자 따라가지 않아도 되는 커뮤니티 — AIC 서울 챕터",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "AI Collective Seoul",
    title: "AI Collective Seoul",
    description: "AI 시대를 혼자 따라가지 않아도 되는 커뮤니티 — AIC 서울 챕터",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Collective Seoul",
    description: "AI 시대를 혼자 따라가지 않아도 되는 커뮤니티 — AIC 서울 챕터",
    images: ["/og-default.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Collective Seoul",
    url: siteUrl,
    description: "The AI Collective Seoul Chapter",
  };

  return (
    <html lang="ko">
      <body className={`${gothicA1.variable} ${spaceGrotesk.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
