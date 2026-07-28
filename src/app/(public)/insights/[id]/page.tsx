import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThumbnailFallback } from "@/components/insights/cards";
import { InsightBody } from "@/components/insights/InsightBody";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDateKo } from "@/lib/content/copy";
import { getInsightById } from "@/lib/queries/content";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getInsightById(id);
  if (!post)
    return pageMetadata({
      title: "Insights",
      description: "",
      path: "/insights",
    });
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/insights/${post.id}`,
    image: post.thumbnailUrl || undefined,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
  });
}

export default async function InsightDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getInsightById(id);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: post.title, path: `/insights/${post.id}` },
          ]),
          articleJsonLd({
            title: post.title,
            description: post.summary,
            path: `/insights/${post.id}`,
            image: post.thumbnailUrl,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
          }),
        ]}
      />
      <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <Link href="/insights" className="text-sm text-[var(--color-ink-muted)]">
          ← Insights
        </Link>
        <p className="mt-8 text-xs tracking-wide text-[var(--color-gold)]">
          {post.category}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink-muted)]">
          {formatDateKo(post.publishedAt)} · {post.author}
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
            <ThumbnailFallback title={post.title} className="absolute inset-0" />
          )}
        </div>
        <p className="mt-8 text-lg text-[var(--color-ink-muted)]">{post.summary}</p>
        <InsightBody body={post.body} />
      </article>
    </>
  );
}
