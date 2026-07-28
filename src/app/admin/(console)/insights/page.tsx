import Link from "next/link";
import { deleteInsightAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { formatDateKo } from "@/lib/content/copy";
import { prisma } from "@/lib/db";

export default async function AdminInsightsPage() {
  await requireModule("insights");
  const posts = await prisma.insightPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Insights</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            CMS · Featured는 1건만
          </p>
        </div>
        <Link
          href="/admin/insights/new"
          className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-sm text-white"
        >
          글 작성
        </Link>
      </div>
      <ul className="divide-y divide-[var(--color-border)]">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">
                {p.title}{" "}
                {p.isFeatured ? (
                  <span className="text-xs text-[var(--color-gold)]">Featured</span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {p.category} · {p.status} · {formatDateKo(p.publishedAt)}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/insights/${p.id}/edit`}
                className="text-[var(--color-cta)] underline"
              >
                편집
              </Link>
              <form action={deleteInsightAction.bind(null, p.id)}>
                <button type="submit" className="underline text-[var(--color-ink-muted)]">
                  삭제
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
