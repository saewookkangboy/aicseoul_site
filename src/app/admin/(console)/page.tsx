import Link from "next/link";
import { auth } from "@/lib/auth";
import { canAccessModule, isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { formatDateKo } from "@/lib/format-date";

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session!.user;

  const [newContacts, recentInsights, latestClass] = await Promise.all([
    canAccessModule(user, "contact")
      ? prisma.contactSubmission.count({ where: { status: "new" } })
      : Promise.resolve(null),
    canAccessModule(user, "insights")
      ? prisma.insightPost.findMany({
          where: { status: "published" },
          orderBy: { publishedAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    canAccessModule(user, "meetups")
      ? prisma.meetup.findFirst({
          where: { type: "class", status: "published" },
          orderBy: { date: "desc" },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">대시보드</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          {user.email} · {user.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {newContacts !== null ? (
          <Link
            href="/admin/contact?status=new"
            className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">미확인 문의</p>
            <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl text-[var(--color-cta)]">
              {newContacts}
            </p>
          </Link>
        ) : null}
        {latestClass ? (
          <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-sm text-[var(--color-ink-muted)]">최근 클래스</p>
            <p className="mt-3 font-medium">{latestClass.title}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              {formatDateKo(latestClass.date)}
            </p>
          </div>
        ) : null}
        {isSuperAdmin(user) ? (
          <Link
            href="/admin/users"
            className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <p className="text-sm text-[var(--color-ink-muted)]">사용자·권한</p>
            <p className="mt-3 text-sm text-[var(--color-cta)]">관리하기 →</p>
          </Link>
        ) : null}
      </div>

      {recentInsights.length > 0 ? (
        <section>
          <h2 className="text-lg font-medium">최근 Insights</h2>
          <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {recentInsights.map((p) => (
              <li key={p.id} className="py-3 text-sm">
                <Link href={`/admin/insights/${p.id}/edit`} className="hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
