import Link from "next/link";
import { headers } from "next/headers";
import { LinkedinLogo } from "@phosphor-icons/react/ssr";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getSiteSettingsMap } from "@/lib/queries/content";

export async function SiteFooter() {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getMessages(locale);
  const settings = await getSiteSettingsMap();
  const linkedin = settings["social.linkedin"]?.trim();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink)]">
            AI Collective Seoul
          </p>
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="AI Collective Seoul LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              <LinkedinLogo size={18} weight="fill" />
            </a>
          ) : null}
        </div>
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
