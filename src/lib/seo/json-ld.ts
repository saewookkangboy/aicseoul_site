// src/lib/seo/json-ld.ts
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  getSiteUrl,
} from "./site";

function abs(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  if (path === "/" || path === "") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd(opts?: { sameAs?: string[] }) {
  const sameAs = (opts?.sameAs ?? []).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    logo: abs(DEFAULT_OG_IMAGE),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    inLanguage: "ko",
    publisher: { "@type": "Organization", name: SITE_NAME, url: getSiteUrl() },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  datePublished?: Date | string | null;
  dateModified?: Date | string | null;
}) {
  const toIso = (v?: Date | string | null) =>
    v ? (v instanceof Date ? v.toISOString() : v) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: abs(input.image || DEFAULT_OG_IMAGE),
    mainEntityOfPage: abs(input.path),
    datePublished: toIso(input.datePublished),
    dateModified: toIso(input.dateModified) ?? toIso(input.datePublished),
    author: { "@type": "Organization", name: SITE_NAME, url: getSiteUrl() },
    publisher: { "@type": "Organization", name: SITE_NAME, url: getSiteUrl() },
  };
}
