import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format-date";
import { localizedPath } from "@/lib/i18n/path";

type Post = {
  id: string;
  title: string;
  category: string;
  summary: string;
  thumbnailUrl: string | null;
  author: string;
  publishedAt: Date | null;
};

export function ThumbnailFallback({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-end bg-[linear-gradient(145deg,var(--color-dark),color-mix(in_srgb,var(--color-gold)_55%,var(--color-dark)))] p-5 ${className ?? ""}`}
    >
      <p className="line-clamp-3 text-lg font-medium leading-snug text-[var(--color-cream)]">
        {title}
      </p>
    </div>
  );
}

export function FeaturedPost({
  locale,
  post,
}: {
  locale: Locale;
  post: Post;
}) {
  return (
    <Reveal>
      <Link
        href={localizedPath(locale, `/insights/${post.id}`)}
        className="group block"
      >
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          Featured
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            ) : (
              <ThumbnailFallback title={post.title} className="absolute inset-0" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-wide text-[var(--color-ink-muted)]">
              {post.category}
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
              {post.title}
            </h2>
            <p className="mt-4 text-[var(--color-ink-muted)]">{post.summary}</p>
            <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-xs text-[var(--color-ink-muted)]">
              {formatDate(locale, post.publishedAt)} · {post.author}
            </p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function PostCard({ locale, post }: { locale: Locale; post: Post }) {
  return (
    <Link
      href={localizedPath(locale, `/insights/${post.id}`)}
      className="group block"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <ThumbnailFallback title={post.title} className="absolute inset-0" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-surface)]/90 px-2.5 py-1 text-[10px] tracking-wide text-[var(--color-ink)]">
          {post.category}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-medium leading-snug">{post.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-ink-muted)]">
        {post.summary}
      </p>
      <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-xs text-[var(--color-ink-muted)]">
        {formatDate(locale, post.publishedAt)}
      </p>
    </Link>
  );
}
