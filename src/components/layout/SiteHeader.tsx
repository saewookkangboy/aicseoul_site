"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/meetups", label: "Meetups" },
  { href: "/people", label: "People" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-stone)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium tracking-tight text-[var(--color-ink)] md:text-base"
        >
          AI Collective{" "}
          <span className="text-[var(--color-gold)]">Seoul</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-7">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
          {isHome ? (
            <span
              className="hidden text-xs tracking-widest text-[var(--color-gold)] md:inline"
              aria-hidden
            >
              KR / EN
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
