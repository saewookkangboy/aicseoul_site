import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo/site";

/** Build/prerender must not require DATABASE_URL (Vercel may lack it until env is configured). */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/meetups",
    "/people",
    "/insights",
    "/contact",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  if (!process.env.DATABASE_URL) {
    return staticRoutes;
  }

  try {
    const posts = await prisma.insightPost.findMany({
      where: { status: "published" },
      select: { id: true, publishedAt: true, updatedAt: true },
    });

    const insightRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/insights/${p.id}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...insightRoutes];
  } catch {
    return staticRoutes;
  }
}
