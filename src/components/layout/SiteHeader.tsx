"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  localeFromPathname,
  localizedPath,
  stripLocalePath,
  swapLocalePath,
} from "@/lib/i18n/path";
import { focusRingClass } from "@/lib/ui/focus";

const NAV_HREFS = [
  { href: "/meetups", key: "meetups" as const },
  { href: "/people", key: "people" as const },
  { href: "/insights", key: "insights" as const },
  { href: "/contact", key: "contact" as const },
];

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

function getFocusable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.tabIndex !== -1);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const barePath = stripLocalePath(pathname);
  const t = getMessages(locale).nav;
  const [open, setOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  if (navPath !== pathname) {
    setNavPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) menuButtonRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const panel = panelRef.current;
    const focusables = panel ? getFocusable(panel) : [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const list = getFocusable(panel);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (active: boolean) =>
    `text-sm tracking-wide transition-colors ${focusRingClass} ${
      active
        ? "text-[var(--color-ink)]"
        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
    }`;

  const navLinks = (
    <>
      {NAV_HREFS.map((item) => {
        const href = localizedPath(locale, item.href);
        const active =
          barePath === item.href || barePath.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={href}
            className={linkClass(active)}
            onClick={() => setOpen(false)}
          >
            {t[item.key]}
          </Link>
        );
      })}
    </>
  );

  const langSwitch = (
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
            onClick={() => {
              setLocaleCookie(code);
              setOpen(false);
            }}
            aria-current={locale === code ? "true" : undefined}
            className={`${focusRingClass} ${
              locale === code
                ? "text-[var(--color-gold)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {code === "ko" ? "KR" : "EN"}
          </Link>
        </span>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-stone)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href={localizedPath(locale, "/")}
          className={`font-[family-name:var(--font-space-grotesk)] text-sm font-medium tracking-tight text-[var(--color-ink)] md:text-base ${focusRingClass}`}
        >
          AI Collective{" "}
          <span className="text-[var(--color-gold)]">Seoul</span>
        </Link>

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label={t.primary}
        >
          {navLinks}
          {langSwitch}
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] md:hidden ${focusRingClass}`}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? t.closeMenu : t.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-5" aria-hidden />
          ) : (
            <List className="size-5" aria-hidden />
          )}
        </button>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[var(--color-dark)]/35 md:hidden"
          aria-label={t.closeMenu}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        ref={panelRef}
        id={menuId}
        className={`fixed inset-x-0 top-[3.25rem] z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)] md:hidden ${
          open ? "block" : "hidden"
        }`}
        {...(!open ? { inert: true } : {})}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-4" aria-label={t.primary}>
          {navLinks}
          <div className="border-t border-[var(--color-border)] pt-4">
            {langSwitch}
          </div>
        </nav>
      </div>
    </header>
  );
}
