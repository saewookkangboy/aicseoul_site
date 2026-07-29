export default function LocaleLoading() {
  return (
    <div
      className="mx-auto flex min-h-[40vh] max-w-lg items-center justify-center px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-[var(--color-ink-muted)]">불러오는 중…</p>
    </div>
  );
}
