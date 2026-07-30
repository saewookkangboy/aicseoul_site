"use client";

import { useActionState, useId } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import {
  btnPrimaryClass,
  errorTextClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "./ui";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  includeName?: boolean;
  /** When true, show required invite code field (ADMIN_SIGNUP_INVITE_CODE set). */
  requireInvite?: boolean;
  /** Post-login relative path (validated server-side). */
  callbackUrl?: string;
};

const initial: AuthFormState = {};

export function AuthForm({
  action,
  submitLabel,
  includeName,
  requireInvite,
  callbackUrl,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const errorId = useId();
  const invalid = Boolean(state.error);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4" aria-busy={pending}>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {includeName ? (
        <label className={labelClass}>
          <span className={labelHintClass}>이름</span>
          <input name="name" required className={fieldClass} />
        </label>
      ) : null}
      {requireInvite ? (
        <label className={labelClass}>
          <span className={labelHintClass}>초대 코드</span>
          <input
            name="inviteCode"
            required
            autoComplete="off"
            className={fieldClass}
          />
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
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
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
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
        />
      </label>
      {state.error ? (
        <p
          id={errorId}
          className={`rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 ${errorTextClass}`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${btnPrimaryClass} mt-2 w-full`}
      >
        {submitLabel}
        {pending ? (
          <span className="text-white/80" aria-hidden>
            · 처리 중…
          </span>
        ) : null}
      </button>
    </form>
  );
}
