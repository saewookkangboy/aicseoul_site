// src/lib/seo/metadata.ts
import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  getSiteUrl,
} from "./site";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  publishedTime?: string;
  robots?: Metadata["robots"];
};

function absolutePath(path: string): string {
  const base = getSiteUrl();
  if (path === "/" || path === "") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  const url = absolutePath(input.path);
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const type = input.type ?? "website";
  const desc = input.description || DEFAULT_DESCRIPTION;
  const title = input.absoluteTitle
    ? { absolute: input.title }
    : input.title;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: input.robots,
    openGraph: {
      type,
      locale: "ko_KR",
      siteName: SITE_NAME,
      title: input.title,
      description: desc,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
      ...(type === "article" && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: desc,
      images: [image],
    },
  };
}
