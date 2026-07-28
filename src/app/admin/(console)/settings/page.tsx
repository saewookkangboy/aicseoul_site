import { updateSettingsAction } from "@/lib/actions/cms";
import { requireModule } from "@/lib/admin";
import { getSiteSettingsMap } from "@/lib/queries/content";

export default async function SettingsPage() {
  await requireModule("settings");
  const s = await getSiteSettingsMap();

  const fields = [
    { key: "stats.members", label: "글로벌 멤버 수" },
    { key: "stats.cities", label: "도시 수" },
    { key: "stats.countries", label: "국가 수" },
    { key: "contact.email", label: "문의 이메일" },
    { key: "contact.sla", label: "응답 SLA 문구" },
    { key: "social.linkedin", label: "LinkedIn URL" },
    { key: "meetup.ctaUrl", label: "모임 신청 CTA URL" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">사이트 설정</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          통계·문의·소셜·CTA. Hero 장문 카피는 코드 상수(P3 제외).
        </p>
      </div>
      <form action={updateSettingsAction} className="flex max-w-xl flex-col gap-4">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-sm">
            <span>{f.label}</span>
            <input
              name={f.key}
              defaultValue={s[f.key] ?? ""}
              className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
        ))}
        <button
          type="submit"
          className="mt-2 w-fit rounded-full bg-[var(--color-cta)] px-5 py-2.5 text-sm text-white"
        >
          저장
        </button>
      </form>
    </div>
  );
}
