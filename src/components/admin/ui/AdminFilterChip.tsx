import Link from "next/link";

type Props = {
  href: string;
  label: string;
  active?: boolean;
};

export function AdminFilterChip({ href, label, active }: Props) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96] motion-reduce:transform-none ${
        active
          ? "border border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]"
      }`}
    >
      {label}
    </Link>
  );
}
