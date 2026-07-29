import Link from "next/link";
import { FeaturedPost, PostCard } from "@/components/insights/cards";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { translateCached } from "@/lib/i18n/translate";
import {
  getFeaturedInsight,
  getPublishedInsights,
} from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function localizePost<
  T extends {
    title: string;
    category: string;
    summary: string;
    author: string;
  },
>(post: T, locale: Locale, memo: Map<string, Promise<string>>) {
  if (locale !== "en") return post;
  const [title, category, summary, author] = await Promise.all([
    translateCached(post.title, locale, { memo }),
    translateCached(post.category, locale, { memo }),
    translateCached(post.summary, locale, { memo }),
    translateCached(post.author, locale, { memo }),
  ]);
  return { ...post, title, category, summary, author };
}

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getMessages(locale);
  return pageMetadata({
    title: "Insights",
    description: t.seo.insightsDescription,
    path: localizedPath(locale, "/insights"),
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function InsightsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const [featured, list] = await Promise.all([
    getFeaturedInsight(),
    getPublishedInsights(page, 9),
  ]);

  const memo = new Map<string, Promise<string>>();
  const featuredView = featured
    ? await localizePost(featured, locale, memo)
    : null;
  const items = await Promise.all(
    list.items.map((post) => localizePost(post, locale, memo)),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: localizedPath(locale, "/") },
          { name: "Insights", path: localizedPath(locale, "/insights") },
        ])}
      />
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
            Insights
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
            {t.insights.title}
          </h1>
          <p className="mt-5 max-w-[55ch] text-[var(--color-ink-muted)]">
            {t.insights.lead}
          </p>
        </Reveal>

        {featuredView ? (
          <div className="mt-14">
            <FeaturedPost locale={locale} post={featuredView} />
          </div>
        ) : null}

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.05}>
              <PostCard locale={locale} post={post} />
            </Reveal>
          ))}
        </div>

        {list.totalPages > page ? (
          <div className="mt-14 flex justify-center">
            <Link
              href={`${localizedPath(locale, "/insights")}?page=${page + 1}`}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm"
            >
              {t.insights.loadMore}
            </Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
