// src/lib/seo/site.ts
export const SITE_NAME = "AI Collective Seoul";
export const SITE_NAME_SHORT = "AIC Seoul";
export const DEFAULT_DESCRIPTION =
  "AI 시대를 혼자 따라가지 않아도 되는 커뮤니티 — AIC 서울 챕터";
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const THEME_COLOR = "#0F0C0A";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
