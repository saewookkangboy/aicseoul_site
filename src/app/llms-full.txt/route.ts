// src/app/llms-full.txt/route.ts
import { prisma } from "@/lib/db";
import { buildLlmsFullTxt } from "@/lib/seo/llms";

export const dynamic = "force-dynamic";

export async function GET() {
  let posts: { id: string; title: string; summary: string }[] = [];
  if (process.env.DATABASE_URL) {
    try {
      posts = await prisma.insightPost.findMany({
        where: { status: "published" },
        select: { id: true, title: true, summary: true },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
    } catch {
      posts = [];
    }
  }
  return new Response(buildLlmsFullTxt(posts), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
