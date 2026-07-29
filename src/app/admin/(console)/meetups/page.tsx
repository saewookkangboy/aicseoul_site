import Link from "next/link";
import {
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  btnDangerGhostClass,
  btnGhostClass,
  btnPrimaryClass,
  fieldClass,
} from "@/components/admin/ui";
import { updateMeetupCtaAction, deleteClassAction } from "@/lib/actions/meetups";
import { requireModule } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { formatDateKo } from "@/lib/format-date";

export default async function AdminMeetupsPage() {
  await requireModule("meetups");
  const [settings, classes] = await Promise.all([
    getSiteSettingsMap(),
    prisma.meetup.findMany({
      where: { type: "class" },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Meetups"
        description="CTA · 클래스 기록 · 사진벽"
        actions={
          <>
            <Link href="/admin/meetups/archive" className={btnGhostClass}>
              사진벽
            </Link>
            <Link href="/admin/meetups/classes/new" className={btnPrimaryClass}>
              클래스 추가
            </Link>
          </>
        }
      />

      <AdminPanel
        title="정기 모임 신청 CTA"
        description="공개 Meetups 페이지 버튼 링크"
      >
        <form action={updateMeetupCtaAction} className="flex flex-wrap gap-2">
          <input
            name="meetup.ctaUrl"
            defaultValue={settings["meetup.ctaUrl"] ?? "/contact"}
            className={`${fieldClass} min-w-[240px] flex-1`}
          />
          <button type="submit" className={btnPrimaryClass}>
            저장
          </button>
        </form>
      </AdminPanel>

      <section>
        <h2 className="font-display text-lg font-medium tracking-tight">
          원데이 클래스
        </h2>
        {classes.length > 0 ? (
          <ul className="mt-4 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
            {classes.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{c.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      {formatDateKo(c.date)}
                    </span>
                    <AdminBadge
                      tone={c.status === "published" ? "success" : "neutral"}
                    >
                      {c.status}
                    </AdminBadge>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/admin/meetups/classes/${c.id}`}
                    className="font-medium text-[var(--color-cta)]"
                  >
                    편집
                  </Link>
                  <form action={deleteClassAction.bind(null, c.id)}>
                    <button type="submit" className={btnDangerGhostClass}>
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <AdminEmpty
              title="클래스가 없습니다"
              description="원데이 클래스 기록을 추가하세요."
              action={
                <Link
                  href="/admin/meetups/classes/new"
                  className={btnPrimaryClass}
                >
                  클래스 추가
                </Link>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
