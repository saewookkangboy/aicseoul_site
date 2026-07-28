import { prisma } from "@/lib/db";

export async function getSiteSettingsMap() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
    string,
    string
  >;
}

export async function getVisibleMembers() {
  return prisma.member.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLatestClassMeetup() {
  return prisma.meetup.findFirst({
    where: { type: "class", status: "published" },
    orderBy: { date: "desc" },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getArchivePhotos(limit = 24) {
  return prisma.archivePhoto.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFeaturedInsight() {
  return prisma.insightPost.findFirst({
    where: { status: "published", isFeatured: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedInsights(page = 1, pageSize = 9) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.insightPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.insightPost.count({ where: { status: "published" } }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getInsightById(id: string) {
  return prisma.insightPost.findFirst({
    where: { id, status: "published" },
  });
}
