import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminStat,
  btnGhostClass,
  btnPrimaryClass,
} from "@/components/admin/ui";
import { auth } from "@/lib/auth";
import { canAccessModule, isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { formatDateKo } from "@/lib/format-date";

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session!.user;

  const [newContacts, recentInsights, latestClass, peopleCount] =
    await Promise.all([
      canAccessModule(user, "contact")
        ? prisma.contactSubmission.count({ where: { status: "new" } })
        : Promise.resolve(null),
      canAccessModule(user, "insights")
        ? prisma.insightPost.findMany({
            where: { status: "published" },
            orderBy: { publishedAt: "desc" },
            take: 4,
          })
        : Promise.resolve([]),
      canAccessModule(user, "meetups")
        ? prisma.meetup.findFirst({
            where: { type: "class", status: "published" },
            orderBy: { date: "desc" },
          })
        : Promise.resolve(null),
      canAccessModule(user, "people")
        ? prisma.member.count({ where: { isVisible: true } })
        : Promise.resolve(null),
    ]);

  const greeting = user.name ? `${user.name}님` : user.email;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="대시보드"
        description={`${greeting} · ${user.role}`}
        actions={
          <Link href="/" className={btnGhostClass}>
            공개 사이트 보기
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {newContacts !== null ? (
          <AdminStat
            label="미확인 문의"
            value={
              <span className={newContacts > 0 ? "text-[var(--color-cta)]" : ""}>
                {newContacts}
              </span>
            }
            hint={newContacts > 0 ? "확인이 필요합니다" : "대기 없음"}
            href="/admin/contact?status=new"
          />
        ) : null}
        {peopleCount !== null ? (
          <AdminStat
            label="공개 멤버"
            value={peopleCount}
            hint="People에 노출 중"
            href="/admin/people"
          />
        ) : null}
        {latestClass ? (
          <AdminStat
            label="최근 클래스"
            value={
              <span className="line-clamp-2 text-xl leading-snug">
                {latestClass.title}
              </span>
            }
            hint={formatDateKo(latestClass.date)}
            href={`/admin/meetups/classes/${latestClass.id}`}
          />
        ) : null}
        {isSuperAdmin(user) ? (
          <AdminStat
            label="사용자 · 권한"
            value={<span className="text-xl">관리</span>}
            hint="SuperAdmin 전용"
            href="/admin/users"
          />
        ) : null}
      </div>

      {canAccessModule(user, "insights") ? (
        <AdminPanel
          title="최근 Insights"
          actions={
            <Link href="/admin/insights/new" className={btnPrimaryClass}>
              글 작성
            </Link>
          }
        >
          {recentInsights.length > 0 ? (
            <ul className="-mx-5 -my-5 divide-y divide-[var(--color-border)]">
              {recentInsights.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/insights/${p.id}/edit`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-cream)]/50"
                  >
                    <span className="min-w-0 truncate font-medium">{p.title}</span>
                    <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">
                      {formatDateKo(p.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty
              title="게시된 글이 없습니다"
              description="첫 Insights를 작성해 공개 페이지에 올려 보세요."
              action={
                <Link href="/admin/insights/new" className={btnPrimaryClass}>
                  글 작성
                </Link>
              }
            />
          )}
        </AdminPanel>
      ) : null}
    </div>
  );
}
