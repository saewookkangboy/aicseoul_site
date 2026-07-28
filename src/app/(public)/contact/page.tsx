import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { contactCopy } from "@/lib/content/copy";
import { getSiteSettingsMap } from "@/lib/queries/content";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Contact",
  description: "협업·후원, 교육, 커뮤니티 참여 문의.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettingsMap();
  const sla = settings["contact.sla"] ?? "3~5일";
  const email = settings["contact.email"] ?? "hello@aic-seoul.example";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
      <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <Reveal>
            <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
              Contact
            </p>
            <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
              {contactCopy.title}
            </h1>
            <p className="mt-5 max-w-[50ch] text-[var(--color-ink-muted)]">
              {contactCopy.lead}
            </p>
          </Reveal>
          <div className="mt-12 space-y-8">
            {contactCopy.types.map((t, i) => (
              <Reveal key={t.title} delay={0.05 * i}>
                <div className="border-t border-[var(--color-border)] pt-5">
                  <h2 className="text-lg font-medium">{t.title}</h2>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-sm text-[var(--color-ink-muted)]">
            또는 이메일로 직접:{" "}
            <a href={`mailto:${email}`} className="text-[var(--color-ink)] underline">
              {email}
            </a>
          </p>
        </div>

        <Reveal delay={0.08}>
          <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
            <h2 className="text-xl font-medium">문의 남기기</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              보통 {sla} 안에 답장드립니다.
            </p>
            <div className="mt-6">
              <ContactForm sla={sla} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    </>
  );
}
