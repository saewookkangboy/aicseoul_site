"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  includeName?: boolean;
  /** When true, show required invite code field (ADMIN_SIGNUP_INVITE_CODE set). */
  requireInvite?: boolean;
};

const initial: AuthFormState = {};

export function AuthForm({
  action,
  submitLabel,
  includeName,
  requireInvite,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      {includeName ? (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--color-ink-muted)]">이름</span>
          <input
            name="name"
            required
            className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
          />
        </label>
      ) : null}
      {requireInvite ? (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--color-ink-muted)]">초대 코드</span>
          <input
            name="inviteCode"
            required
            autoComplete="off"
            className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={includeName ? "new-password" : "current-password"}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[var(--color-cta)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-[var(--color-cta)] px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "처리 중…" : submitLabel}
      </button>
    </form>
  );
}
