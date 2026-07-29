import Link from "next/link";
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
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Meetups</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          CTA · 클래스 기록 · 사진벽
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-medium">정기 모임 신청 CTA URL</h2>
        <form action={updateMeetupCtaAction} className="mt-3 flex flex-wrap gap-2">
          <input
            name="meetup.ctaUrl"
            defaultValue={settings["meetup.ctaUrl"] ?? "/contact"}
            className="min-w-[240px] flex-1 rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-sm text-white"
          >
            저장
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-medium">원데이 클래스</h2>
          <div className="flex gap-3">
            <Link href="/admin/meetups/archive" className="text-sm underline">
              사진벽
            </Link>
            <Link
              href="/admin/meetups/classes/new"
              className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-sm text-white"
            >
              클래스 추가
            </Link>
          </div>
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {classes.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {formatDateKo(c.date)} · {c.status}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  href={`/admin/meetups/classes/${c.id}`}
                  className="text-[var(--color-cta)] underline"
                >
                  편집
                </Link>
                <form action={deleteClassAction.bind(null, c.id)}>
                  <button type="submit" className="underline text-[var(--color-ink-muted)]">
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
