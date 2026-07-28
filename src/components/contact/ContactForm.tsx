"use client";

import { useActionState } from "react";
import {
  submitContactAction,
  type ContactFormState,
} from "@/lib/actions/contact";

const initial: ContactFormState = {};

const TYPES = [
  { value: "partnership", label: "협업 · 후원" },
  { value: "education", label: "교육 문의" },
  { value: "community", label: "커뮤니티 참여" },
  { value: "other", label: "기타" },
] as const;

export function ContactForm({ sla }: { sla: string }) {
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initial,
  );

  if (state.ok) {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-xl font-medium">문의가 접수되었습니다</h3>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          보통 {sla} 안에 답장드립니다. 남겨 주신 이메일로 연락드릴게요.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-3 text-sm text-[var(--color-ink-muted)]">
          어떤 문의인가요?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm has-[:checked]:border-[var(--color-cta)] has-[:checked]:text-[var(--color-cta)]"
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                required
                defaultChecked={t.value === "partnership"}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">이름</span>
        <input
          name="name"
          required
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">소속 (선택)</span>
        <input
          name="org"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">이메일</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">내용</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="문의 내용을 자유롭게 적어주세요."
          className="resize-y rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {state.error ? (
        <p className="text-sm text-[var(--color-cta)]" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "보내는 중…" : "문의 보내기"}
      </button>
    </form>
  );
}
