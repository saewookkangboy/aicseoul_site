import type { Metadata } from "next";
import Link from "next/link";
import { FeaturedPost, PostCard } from "@/components/insights/cards";
import { Reveal } from "@/components/motion/Reveal";
import {
  getFeaturedInsight,
  getPublishedInsights,
} from "@/lib/queries/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights",
  description: "모임 기록, 클래스 노트, 커뮤니티 이야기를 남깁니다.",
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function InsightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const [featured, list] = await Promise.all([
    getFeaturedInsight(),
    getPublishedInsights(page, 9),
  ]);

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          Insights
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
          기록과 배움
        </h1>
        <p className="mt-5 max-w-[55ch] text-[var(--color-ink-muted)]">
          대화는 사라지기 쉽습니다. 그래서 모임과 클래스의 배움을 짧게라도
          남깁니다.
        </p>
      </Reveal>

      {featured ? (
        <div className="mt-14">
          <FeaturedPost post={featured} />
        </div>
      ) : null}

      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {list.items.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 0.05}>
            <PostCard post={post} />
          </Reveal>
        ))}
      </div>

      {list.totalPages > page ? (
        <div className="mt-14 flex justify-center">
          <Link
            href={`/insights?page=${page + 1}`}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm"
          >
            더 보기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
