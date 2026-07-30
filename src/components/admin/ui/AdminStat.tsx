import Link from "next/link";
import type { ReactNode } from "react";
import { panelClass } from "./classes";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
};

export function AdminStat({ label, value, hint, href }: Props) {
  const inner = (
    <>
      <p className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-medium tracking-tight text-[var(--color-ink)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-[var(--color-ink-muted)]">{hint}</p>
      ) : null}
    </>
  );

  const className = `${panelClass} block p-5 transition-[border-color,transform] duration-200 ${
    href
      ? "hover:border-[var(--color-gold)] hover:-translate-y-px active:scale-[0.96] motion-reduce:transform-none"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
