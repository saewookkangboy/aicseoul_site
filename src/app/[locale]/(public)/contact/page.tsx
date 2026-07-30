import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getMessages(locale);
  return pageMetadata({
    title: "Contact",
    description: t.seo.contactDescription,
    path: localizedPath(locale, "/contact"),
    openGraphLocale: locale === "en" ? "en_US" : "ko_KR",
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const settings = await getSiteSettingsMap();
  const sla = settings["contact.sla"] ?? (locale === "en" ? "3–5 days" : "3~5일");
  const email = settings["contact.email"] ?? "hello@aic-seoul.example";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: localizedPath(locale, "/") },
          { name: "Contact", path: localizedPath(locale, "/contact") },
        ])}
      />
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <Reveal>
              <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
                {t.contact.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
                {t.contact.title}
              </h1>
              <p className="mt-5 max-w-[50ch] text-[var(--color-ink-muted)]">
                {t.contact.lead}
              </p>
            </Reveal>
            <div className="mt-12 space-y-8">
              {t.contact.types.map((item, i) => (
                <Reveal key={item.title} delay={0.05 * i}>
                  <div className="border-t border-[var(--color-border)] pt-5">
                    <h2 className="text-lg font-medium">{item.title}</h2>
                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-10 text-sm text-[var(--color-ink-muted)]">
              {t.contact.orEmail}{" "}
              <a
                href={`mailto:${email}`}
                className="text-[var(--color-ink)] underline"
              >
                {email}
              </a>
            </p>
          </div>

          <Reveal delay={0.08}>
            <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
              <h2 className="text-xl font-medium">{t.contact.formTitle}</h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {t.contact.formSla.replace("{sla}", sla)}
              </p>
              <div className="mt-6">
                <ContactForm sla={sla} copy={t.contact.form} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
