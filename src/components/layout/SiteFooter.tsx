import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink)]">
          AI Collective Seoul
        </p>
        <p className="text-sm text-[var(--color-ink-muted)]">
          AI 시대를 혼자 따라가지 않아도 되는 커뮤니티
        </p>
        <Link
          href="/admin/login"
          className="text-xs tracking-wide text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
