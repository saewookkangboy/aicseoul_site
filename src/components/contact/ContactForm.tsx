"use client";

import { useActionState } from "react";
import {
  submitContactAction,
  type ContactFormState,
} from "@/lib/actions/contact";
import type { Messages } from "@/lib/i18n/messages";

const initial: ContactFormState = {};

export function ContactForm({
  sla,
  copy,
}: {
  sla: string;
  copy: Messages["contact"]["form"];
}) {
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initial,
  );

  if (state.ok) {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-xl font-medium">{copy.successTitle}</h3>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          {copy.successBody.replace("{sla}", sla)}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-3 text-sm text-[var(--color-ink-muted)]">
          {copy.legend}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {copy.types.map((t) => (
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
        <span className="text-[var(--color-ink-muted)]">{copy.name}</span>
        <input
          name="name"
          required
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">{copy.org}</span>
        <input
          name="org"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">{copy.email}</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--color-ink-muted)]">{copy.message}</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder={copy.messagePlaceholder}
          className="resize-y rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 outline-none focus:border-[var(--color-gold)]"
        />
      </label>

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
        {pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
