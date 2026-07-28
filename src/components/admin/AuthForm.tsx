"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import { btnPrimaryClass, fieldClass, labelClass, labelHintClass } from "./ui";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  includeName?: boolean;
};

const initial: AuthFormState = {};

export function AuthForm({ action, submitLabel, includeName }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {includeName ? (
        <label className={labelClass}>
          <span className={labelHintClass}>이름</span>
          <input name="name" required className={fieldClass} />
        </label>
      ) : null}
      <label className={labelClass}>
        <span className={labelHintClass}>이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        <span className={labelHintClass}>비밀번호</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={includeName ? "new-password" : "current-password"}
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p
          className="rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--color-cta)_10%,transparent)] px-3 py-2 text-sm text-[var(--color-cta)]"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={`${btnPrimaryClass} mt-2 w-full`}>
        {pending ? "처리 중…" : submitLabel}
      </button>
    </form>
  );
}
