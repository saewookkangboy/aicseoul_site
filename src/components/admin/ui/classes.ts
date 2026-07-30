/** Shared Admin console class tokens. Inputs soft radius, CTAs pill. */

const focusRingClass =
  "outline-none focus-visible:border-[var(--color-gold)] focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]";

export const fieldClass = `w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] ${focusRingClass} transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--color-ink-muted)]`;

export const labelClass =
  "flex flex-col gap-1.5 text-sm text-[var(--color-ink)]";

export const labelHintClass = "text-[var(--color-ink-muted)]";

const btnFocusClass =
  "outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]";

export const btnPrimaryClass = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-cta)] px-5 py-2.5 text-sm font-medium text-white transition-[transform,opacity,background-color] duration-200 hover:opacity-95 active:scale-[0.98] motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-55 ${btnFocusClass}`;

export const btnSecondaryClass = `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-[transform,border-color,background-color] duration-200 hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] active:scale-[0.98] motion-reduce:transform-none ${btnFocusClass}`;

export const btnGhostClass = `inline-flex items-center justify-center gap-1.5 text-sm text-[var(--color-ink-muted)] transition-colors duration-200 hover:text-[var(--color-ink)] ${btnFocusClass}`;

export const btnDangerGhostClass = `inline-flex items-center justify-center text-sm text-[var(--color-ink-muted)] transition-colors duration-200 hover:text-[var(--color-danger)] ${btnFocusClass}`;

export const panelClass =
  "rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]";

export const tableWrapClass =
  "overflow-x-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]";

export const tableClass = "w-full min-w-[640px] border-collapse text-left text-sm";

export const thClass =
  "border-b border-[var(--color-border)] bg-[var(--color-cream)]/50 px-4 py-3 font-medium text-[var(--color-ink-muted)] first:pl-5 last:pr-5";

export const tdClass =
  "border-b border-[var(--color-border)] px-4 py-3.5 align-middle last:border-b-0 first:pl-5 last:pr-5";

export const errorTextClass = "text-sm text-[var(--color-danger)]";
