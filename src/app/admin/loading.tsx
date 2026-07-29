export default function AdminLoading() {
  return (
    <div
      className="mx-auto flex min-h-[30vh] max-w-lg items-center justify-center px-6 py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-[var(--color-ink-muted)]">불러오는 중…</p>
    </div>
  );
}
