import { prisma } from "@/lib/db";

export async function getSiteSettingsMap() {
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
      string,
      string
    >;
  } catch (err) {
    console.error("[db] getSiteSettingsMap failed", err);
    return {} as Record<string, string>;
  }
}

export async function getVisibleMembers() {
  try {
    return await prisma.member.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("[db] getVisibleMembers failed", err);
    return [];
  }
}

export async function getLatestClassMeetup() {
  try {
    return await prisma.meetup.findFirst({
      where: { type: "class", status: "published" },
      orderBy: { date: "desc" },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (err) {
    console.error("[db] getLatestClassMeetup failed", err);
    return null;
  }
}

export async function getArchivePhotos(limit = 24) {
  try {
    return await prisma.archivePhoto.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (err) {
    console.error("[db] getArchivePhotos failed", err);
    return [];
  }
}

export async function getFeaturedInsight() {
  try {
    return await prisma.insightPost.findFirst({
      where: { status: "published", isFeatured: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (err) {
    console.error("[db] getFeaturedInsight failed", err);
    return null;
  }
}

export async function getPublishedInsights(page = 1, pageSize = 9) {
  const skip = (page - 1) * pageSize;
  try {
    const [items, total] = await Promise.all([
      prisma.insightPost.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.insightPost.count({ where: { status: "published" } }),
    ]);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (err) {
    console.error("[db] getPublishedInsights failed", err);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

export async function getInsightById(id: string) {
  try {
    return await prisma.insightPost.findFirst({
      where: { id, status: "published" },
    });
  } catch (err) {
    console.error("[db] getInsightById failed", err);
    return null;
  }
}
