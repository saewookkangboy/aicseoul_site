"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import {
  localeFromPathname,
  localizedPath,
  stripLocalePath,
  swapLocalePath,
} from "@/lib/i18n/path";

const NAV = [
  { href: "/meetups", label: "Meetups" },
  { href: "/people", label: "People" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
] as const;

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const barePath = stripLocalePath(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-stone)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href={localizedPath(locale, "/")}
          className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium tracking-tight text-[var(--color-ink)] md:text-base"
        >
          AI Collective{" "}
          <span className="text-[var(--color-gold)]">Seoul</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-7" aria-label="Primary">
          {NAV.map((item) => {
            const href = localizedPath(locale, item.href);
            const active =
              barePath === item.href || barePath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={href}
                className={`text-xs tracking-wide transition-colors md:text-sm ${
                  active
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div
            className="flex items-center gap-1.5 text-xs tracking-widest"
            role="group"
            aria-label="Language"
          >
            {(["ko", "en"] as const).map((code, i) => (
              <span key={code} className="flex items-center gap-1.5">
                {i > 0 ? (
                  <span className="text-[var(--color-ink-muted)]" aria-hidden>
                    /
                  </span>
                ) : null}
                <Link
                  href={swapLocalePath(pathname, code)}
                  hrefLang={code}
                  lang={code}
                  onClick={() => setLocaleCookie(code)}
                  aria-current={locale === code ? "true" : undefined}
                  className={
                    locale === code
                      ? "text-[var(--color-gold)]"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }
                >
                  {code === "ko" ? "KR" : "EN"}
                </Link>
              </span>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
