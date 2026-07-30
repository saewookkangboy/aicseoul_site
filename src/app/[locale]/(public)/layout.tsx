import { headers } from "next/headers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LOCALE_HEADER, defaultLocale, isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { focusRingClass } from "@/lib/ui/focus";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const raw = headerList.get(LOCALE_HEADER);
  const locale = isLocale(raw) ? raw : defaultLocale;
  const skip = getMessages(locale).nav.skipToContent;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a
        href="#main"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:shadow-[var(--shadow-soft)] ${focusRingClass}`}
      >
        {skip}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
