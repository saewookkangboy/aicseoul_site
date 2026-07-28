import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmpty({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-cream)]/40 px-6 py-10">
      <p className="font-display text-lg font-medium tracking-tight">
        {title}
      </p>
      {description ? (
        <p className="max-w-[48ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
