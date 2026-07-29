import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { locales } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/path";
import { getSiteUrl } from "@/lib/seo/site";

/** Build/prerender must not require DATABASE_URL (Vercel may lack it until env is configured). */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticBare = ["", "/meetups", "/people", "/insights", "/contact"];

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticBare.map((path) => {
      const localized = localizedPath(locale, path || "/");
      return {
        url: `${base}${localized}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : 0.7,
      };
    }),
  );

  if (!process.env.DATABASE_URL) {
    return staticRoutes;
  }

  try {
    const posts = await prisma.insightPost.findMany({
      where: { status: "published" },
      select: { id: true, publishedAt: true, updatedAt: true },
    });

    const insightRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
      posts.map((p) => ({
        url: `${base}${localizedPath(locale, `/insights/${p.id}`)}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );

    return [...staticRoutes, ...insightRoutes];
  } catch {
    return staticRoutes;
  }
}
