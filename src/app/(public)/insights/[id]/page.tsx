import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ThumbnailFallback } from "@/components/insights/cards";
import { formatDateKo } from "@/lib/content/copy";
import { getInsightById } from "@/lib/queries/content";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getInsightById(id);
  if (!post) return { title: "Insights" };
  const image = post.thumbnailUrl || "/og-default.svg";
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [image],
    },
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getInsightById(id);
  if (!post) notFound();

  return (
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
      <div className="prose-aic mt-8 space-y-4 text-base leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_p]:text-[var(--color-ink)] [&_ul]:list-disc [&_ul]:pl-5">
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
}
