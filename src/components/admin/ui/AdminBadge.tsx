type Tone = "neutral" | "accent" | "gold" | "success" | "warn";

const TONE: Record<Tone, string> = {
  neutral:
    "bg-[var(--color-cream)] text-[var(--color-ink-muted)] ring-[var(--color-border)]",
  accent:
    "bg-[color-mix(in_srgb,var(--color-cta)_12%,transparent)] text-[var(--color-cta)] ring-[color-mix(in_srgb,var(--color-cta)_28%,transparent)]",
  gold: "bg-[color-mix(in_srgb,var(--color-gold)_18%,transparent)] text-[color-mix(in_srgb,var(--color-ink)_70%,var(--color-gold))] ring-[color-mix(in_srgb,var(--color-gold)_40%,transparent)]",
  success:
    "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success-fg)] ring-[color-mix(in_srgb,var(--color-success)_28%,transparent)]",
  warn: "bg-[color-mix(in_srgb,var(--color-gold)_22%,transparent)] text-[var(--color-ink)] ring-[var(--color-gold)]",
};

type Props = {
  children: React.ReactNode;
  tone?: Tone;
};

export function AdminBadge({ children, tone = "neutral" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ring-1 ring-inset ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
