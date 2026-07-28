import Link from "next/link";
import {
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  btnDangerGhostClass,
  btnPrimaryClass,
} from "@/components/admin/ui";
import { deleteInsightAction } from "@/lib/actions/insights-contact";
import { requireModule } from "@/lib/admin";
import { formatDateKo } from "@/lib/format-date";
import { prisma } from "@/lib/db";

export default async function AdminInsightsPage() {
  await requireModule("insights");
  const posts = await prisma.insightPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Insights"
        description="CMS · Featured는 1건만"
        actions={
          <Link href="/admin/insights/new" className={btnPrimaryClass}>
            글 작성
          </Link>
        }
      />
      {posts.length > 0 ? (
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  {p.isFeatured ? (
                    <AdminBadge tone="gold">Featured</AdminBadge>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                  {p.category} · {p.status} · {formatDateKo(p.publishedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href={`/admin/insights/${p.id}/edit`}
                  className="font-medium text-[var(--color-cta)]"
                >
                  편집
                </Link>
                <form action={deleteInsightAction.bind(null, p.id)}>
                  <button type="submit" className={btnDangerGhostClass}>
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <AdminEmpty
          title="글이 없습니다"
          description="첫 Insights를 작성해 보세요."
          action={
            <Link href="/admin/insights/new" className={btnPrimaryClass}>
              글 작성
            </Link>
          }
        />
      )}
    </div>
  );
}
