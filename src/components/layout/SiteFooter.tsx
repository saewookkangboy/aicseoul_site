import Link from "next/link";
import { headers } from "next/headers";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function SiteFooter() {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getMessages(locale);

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink)]">
          AI Collective Seoul
        </p>
        <p className="text-sm text-[var(--color-ink-muted)]">{t.footer.tagline}</p>
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
