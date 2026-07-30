import Link from "next/link";
import { headers } from "next/headers";
import { CirclesThree, LinkedinLogo } from "@phosphor-icons/react/ssr";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { resolveChapterLinkedinUrl } from "@/lib/social/linkedin";

export async function SiteFooter() {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getMessages(locale);
  const settings = await getSiteSettingsMap();
  const linkedin = resolveChapterLinkedinUrl(settings["social.linkedin"]);

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <p className="font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink)]">
            AI Collective Seoul
          </p>
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="AI Collective Seoul LinkedIn"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-ink)_22%,transparent)] bg-[var(--color-cream)] text-[var(--color-ink)] transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:bg-[var(--color-surface)] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            <LinkedinLogo size={18} weight="fill" aria-hidden />
          </a>
        </div>
        <p className="text-sm text-[var(--color-ink-muted)]">{t.footer.tagline}</p>
        <Link
          href="/admin/login"
          aria-label="운영 콘솔"
          className="inline-flex size-8 shrink-0 items-center justify-center self-start text-[color-mix(in_srgb,var(--color-ink-muted)_40%,transparent)] transition-colors duration-200 hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] md:self-auto"
        >
          <CirclesThree size={16} weight="fill" aria-hidden />
        </Link>
      </div>
    </footer>
  );
}
