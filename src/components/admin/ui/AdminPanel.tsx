import type { ReactNode } from "react";
import { panelClass } from "./classes";

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPanel({
  children,
  className = "",
  title,
  description,
  actions,
}: Props) {
  return (
    <section className={`${panelClass} ${className}`.trim()}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-medium text-[var(--color-ink)]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
