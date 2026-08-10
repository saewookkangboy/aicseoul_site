import {
  AdminPageHeader,
  AdminPanel,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
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
    { key: "social.openchat", label: "카카오 오픈채팅 URL" },
    { key: "meetup.ctaUrl", label: "모임 신청 CTA URL" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="사이트 설정"
        description="통계·문의·소셜·CTA. Hero 장문 카피는 코드 상수(P3 제외)."
      />
      <AdminPanel>
        <form action={updateSettingsAction} className="flex max-w-xl flex-col gap-4">
          {fields.map((f) => (
            <label key={f.key} className={labelClass}>
              <span className={labelHintClass}>{f.label}</span>
              <input
                name={f.key}
                defaultValue={s[f.key] ?? ""}
                className={fieldClass}
              />
            </label>
          ))}
          <button type="submit" className={`${btnPrimaryClass} mt-2 w-fit`}>
            저장
          </button>
        </form>
      </AdminPanel>
    </div>
  );
}
