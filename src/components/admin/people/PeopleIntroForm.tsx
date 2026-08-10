"use client";

import {
  AdminPanel,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
import {
  DEFAULT_PEOPLE_INTRO,
  type PeopleIntroCopy,
} from "@/lib/people/intro";

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial: PeopleIntroCopy;
};

function rolesForForm(initial: PeopleIntroCopy) {
  const roles = [...initial.roles];
  while (roles.length < 4) {
    roles.push(DEFAULT_PEOPLE_INTRO.roles[roles.length]!);
  }
  return roles.slice(0, 4);
}

export function PeopleIntroForm({ action, initial }: Props) {
  const roles = rolesForForm(initial);

  return (
    <AdminPanel>
      <form action={action} className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-medium">운영진 소개 카피</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            퍼블릭 `/people` 상단 매니페스토·역할 4칸·마무리 문구입니다. 한글
            기준으로 수정하면 EN은 자동 번역됩니다.
          </p>
        </div>

        <label className={labelClass}>
          <span className={labelHintClass}>
            매니페스토 (줄마다 한 문장, 빈 줄 제외)
          </span>
          <textarea
            name="manifesto"
            required
            rows={5}
            defaultValue={initial.manifesto.join("\n")}
            className={`${fieldClass} min-h-[8rem] font-sans`}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role, i) => (
            <fieldset
              key={i}
              className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-cream)]/40 p-4"
            >
              <legend className="px-1 text-sm font-medium">역할 {i + 1}</legend>
              <label className={labelClass}>
                <span className={labelHintClass}>제목</span>
                <input
                  name={`roleTitle${i}`}
                  required
                  defaultValue={role.title}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                <span className={labelHintClass}>핵심 문장</span>
                <input
                  name={`roleLead${i}`}
                  required
                  defaultValue={role.lead}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                <span className={labelHintClass}>보조 문장</span>
                <input
                  name={`roleBody${i}`}
                  required
                  defaultValue={role.body}
                  className={fieldClass}
                />
              </label>
            </fieldset>
          ))}
        </div>

        <label className={labelClass}>
          <span className={labelHintClass}>멤버 그리드 앞 브릿지 문구</span>
          <input
            name="bridge"
            required
            defaultValue={initial.bridge}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          <span className={labelHintClass}>페이지 하단 클로징</span>
          <input
            name="closing"
            required
            defaultValue={initial.closing}
            className={fieldClass}
          />
        </label>

        <button type="submit" className={`${btnPrimaryClass} w-fit`}>
          소개 카피 저장
        </button>
      </form>
    </AdminPanel>
  );
}
