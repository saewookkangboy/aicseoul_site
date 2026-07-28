import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

function baseUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const posts = await prisma.insightPost.findMany({
    where: { status: "published" },
    select: { id: true, publishedAt: true, updatedAt: true },
  });

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

  const insightRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/insights/${p.id}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...insightRoutes];
}
