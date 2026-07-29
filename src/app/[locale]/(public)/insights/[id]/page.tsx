import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThumbnailFallback } from "@/components/insights/cards";
import { InsightBody } from "@/components/insights/InsightBody";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format-date";
import { localizedPath } from "@/lib/i18n/path";
import { translateCached } from "@/lib/i18n/translate";
import { getInsightById } from "@/lib/queries/content";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const post = await getInsightById(id);
  if (!post) {
    return pageMetadata({
      title: "Insights",
      description: "",
      path: localizedPath(locale, "/insights"),
    });
  }
  const memo = new Map<string, Promise<string>>();
  const title =
    locale === "en"
      ? await translateCached(post.title, locale, { memo })
      : post.title;
  const summary =
    locale === "en"
      ? await translateCached(post.summary, locale, { memo })
      : post.summary;
  return pageMetadata({
    title,
    description: summary,
    path: localizedPath(locale, `/insights/${post.id}`),
    image: post.thumbnailUrl || undefined,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function InsightDetailPage({ params }: Props) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const post = await getInsightById(id);
  if (!post) notFound();

  const memo = new Map<string, Promise<string>>();
  let title = post.title;
  let category = post.category;
  let summary = post.summary;
  let body = post.body;
  let author = post.author;
  if (locale === "en") {
    [title, category, summary, body, author] = await Promise.all([
      translateCached(post.title, locale, { memo }),
      translateCached(post.category, locale, { memo }),
      translateCached(post.summary, locale, { memo }),
      translateCached(post.body, locale, { memo, html: true }),
      translateCached(post.author, locale, { memo }),
    ]);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: localizedPath(locale, "/") },
            { name: "Insights", path: localizedPath(locale, "/insights") },
            {
              name: title,
              path: localizedPath(locale, `/insights/${post.id}`),
            },
          ]),
          articleJsonLd({
            title,
            description: summary,
            path: localizedPath(locale, `/insights/${post.id}`),
            image: post.thumbnailUrl,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
          }),
        ]}
      />
      <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <Link
          href={localizedPath(locale, "/insights")}
          className="text-sm text-[var(--color-ink-muted)]"
        >
          ← Insights
        </Link>
        <p className="mt-8 text-xs tracking-wide text-[var(--color-gold)]">
          {category}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink-muted)]">
          {formatDate(locale, post.publishedAt)} · {author}
        </p>
        <div className="relative mt-8 aspect-video overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 768px"
              priority
            />
          ) : (
            <ThumbnailFallback title={title} className="absolute inset-0" />
          )}
        </div>
        <p className="mt-8 text-lg text-[var(--color-ink-muted)]">{summary}</p>
        <InsightBody body={body} />
      </article>
    </>
  );
}
