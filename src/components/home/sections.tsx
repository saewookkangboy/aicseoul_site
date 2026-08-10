import Link from "next/link";
import type { ReactNode } from "react";
import {
  Buildings,
  ChatTeardropText,
  GlobeHemisphereWest,
  LinkedinLogo,
  Users,
} from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/path";
import { CHAPTER_LINKEDIN_URL } from "@/lib/social/linkedin";
import { CHAPTER_OPENCHAT_URL } from "@/lib/social/openchat";

type NowrapAt = "md" | "lg" | "xl" | false;
type TextAlign = "left" | "center";

const nowrapClassName: Record<Exclude<NowrapAt, false>, string> = {
  md: "md:whitespace-nowrap",
  lg: "lg:whitespace-nowrap",
  xl: "xl:whitespace-nowrap",
};

const ctaPrimaryClass =
  "inline-flex rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

const ctaSecondaryClass =
  "inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-cream)_28%,transparent)] px-6 py-3 text-sm text-[var(--color-cream)]";

const ctaSoftClass =
  "inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-cta)] outline-none transition-colors hover:border-[var(--color-cta)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

function HomeLine({
  children,
  className = "",
  as: Tag = "p",
  nowrap = "lg",
  keepAll = true,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3";
  nowrap?: NowrapAt;
  keepAll?: boolean;
  align?: TextAlign;
}) {
  const nowrapClass = nowrap ? nowrapClassName[nowrap] : "";
  const breakClass = keepAll ? "break-keep" : "break-normal";
  const alignClass = align === "center" ? "text-center" : "text-left";
  return (
    <Tag
      className={`${alignClass} ${breakClass} ${nowrapClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

function HomeLines({
  lines,
  className = "",
  itemClassName = "",
  nowrap = "lg",
  align = "left",
}: {
  lines: readonly string[];
  className?: string;
  itemClassName?: string;
  nowrap?: NowrapAt;
  align?: TextAlign;
}) {
  return (
    <div className={className}>
      {lines.map((line) => (
        <HomeLine
          key={line}
          className={itemClassName}
          nowrap={nowrap}
          align={align}
        >
          {line}
        </HomeLine>
      ))}
    </div>
  );
}

type HomeProps = { locale: Locale; t: Messages["home"] };

export function HomeHero({ locale, t }: HomeProps) {
  const isEn = locale === "en";

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-dark)] text-[var(--color-cream)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col items-center justify-center px-5 py-24 text-center md:px-8 md:py-32">
        <div className="flex w-full max-w-[52rem] flex-col items-center">
          <Reveal>
            <HomeLine
              nowrap="md"
              align="center"
              className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.22em] text-[var(--color-gold)]"
            >
              {t.kicker}
            </HomeLine>
          </Reveal>
          <Reveal delay={0.08}>
            <HomeLine
              as="h1"
              nowrap={isEn ? false : "lg"}
              keepAll={!isEn}
              align="center"
              className={
                isEn
                  ? "mt-6 whitespace-pre-line text-4xl font-medium leading-[1.12] tracking-tight md:text-5xl lg:text-6xl"
                  : "mt-6 text-4xl font-medium leading-[1.12] tracking-tight md:text-5xl lg:text-6xl"
              }
            >
              {t.headline}
            </HomeLine>
          </Reveal>
          <Reveal delay={0.14}>
            <HomeLine
              nowrap="lg"
              align="center"
              className="mt-5 font-[family-name:var(--font-space-grotesk)] text-base text-[color-mix(in_srgb,var(--color-cream)_72%,transparent)] md:text-lg"
            >
              {t.subheadline}
            </HomeLine>
          </Reveal>
          <Reveal delay={0.2}>
            <HomeLines
              lines={t.body}
              nowrap={false}
              align="center"
              className="mt-8 w-full max-w-[36rem] space-y-4"
              itemClassName="whitespace-pre-line text-base leading-[1.75] text-[color-mix(in_srgb,var(--color-cream)_78%,transparent)] md:text-lg md:leading-[1.8]"
            />
            <HomeLines
              lines={t.aux}
              nowrap={false}
              align="center"
              className="mt-5 w-full max-w-[36rem] space-y-1.5"
              itemClassName="text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-cream)_55%,transparent)]"
            />
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href={localizedPath(locale, "/meetups")}
                className={ctaPrimaryClass}
              >
                {t.ctaMeetups}
              </Link>
              <Link
                href={localizedPath(locale, "/contact")}
                className={ctaSecondaryClass}
              >
                {t.ctaContact}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HomeStats({
  locale: _locale,
  t,
  members,
  cities,
  countries,
}: HomeProps & { members: string; cities: string; countries: string }) {
  void _locale;
  const stats = [
    { value: members, label: t.stats.members, Icon: Users },
    { value: cities, label: t.stats.cities, Icon: Buildings },
    { value: countries, label: t.stats.countries, Icon: GlobeHemisphereWest },
  ];

  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-28">
      <Reveal>
        <HomeLine
          as="h2"
          nowrap="md"
          className="text-3xl font-medium tracking-tight md:text-4xl"
        >
          {t.globalTitle}
        </HomeLine>
        <HomeLines
          lines={t.globalBody}
          nowrap="xl"
          className="mt-5 space-y-2"
          itemClassName="text-base leading-relaxed text-[var(--color-ink-muted)]"
        />
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0">
          {stats.map((s) => (
            <div key={s.label} className="text-left">
              <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-medium md:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs tracking-wide text-[var(--color-ink-muted)]">
                {s.label}
              </p>
              <s.Icon
                size={22}
                weight="duotone"
                className="mt-3 text-[var(--color-gold)]"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export function HomeReasons({ locale: _locale, t }: HomeProps) {
  void _locale;
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <HomeLine
            nowrap="md"
            className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]"
          >
            {t.whyEyebrow}
          </HomeLine>
          <HomeLine
            as="h2"
            nowrap="md"
            className="mt-3 text-3xl font-medium tracking-tight md:text-4xl"
          >
            {t.whyTitle}
          </HomeLine>
          <HomeLines
            lines={t.whyLead}
            nowrap="xl"
            className="mt-5 space-y-1"
            itemClassName="text-[var(--color-ink-muted)]"
          />
          <HomeLines
            lines={t.whyBody}
            nowrap="xl"
            className="mt-3 space-y-1"
            itemClassName="text-[var(--color-ink-muted)]"
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {t.reasons.map((r, i) => (
            <Reveal key={r.title} delay={0.06 * i}>
              <div className="h-full border border-[var(--color-border)] bg-[var(--color-cream)]/50 px-5 py-6 text-left md:px-6">
                <HomeLine
                  as="h3"
                  nowrap="md"
                  className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium tracking-wide"
                >
                  {r.title}
                </HomeLine>
                <HomeLines
                  lines={r.body}
                  nowrap={false}
                  className="mt-3 space-y-2"
                  itemClassName="text-sm leading-relaxed text-[var(--color-ink-muted)]"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeActivities({ locale, t }: HomeProps) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <HomeLine
          nowrap="md"
          className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]"
        >
          {t.whatEyebrow}
        </HomeLine>
        <HomeLine
          as="h2"
          nowrap="lg"
          className="mt-3 text-3xl font-medium tracking-tight md:text-4xl"
        >
          {t.whatTitle}
        </HomeLine>
        <HomeLines
          lines={t.whatLead}
          nowrap="xl"
          className="mt-5 space-y-1"
          itemClassName="text-[var(--color-ink-muted)]"
        />
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {t.activities.map((a, i) => (
          <Reveal key={a.title} delay={0.06 * i}>
            <article className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-left md:px-6">
              <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-wide text-[var(--color-ink-muted)]">
                {a.tag}
              </p>
              <HomeLine
                as="h3"
                nowrap="md"
                className="mt-3 text-xl font-medium"
              >
                {a.title}
              </HomeLine>
              <HomeLines
                lines={a.body}
                nowrap={false}
                className="mt-3 flex-1 space-y-2"
                itemClassName="text-sm leading-relaxed text-[var(--color-ink-muted)]"
              />
              <Link
                href={localizedPath(locale, a.href)}
                className={`${ctaSoftClass} mt-6 w-fit`}
              >
                {a.cta}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HomePeopleTeaser({ locale, t }: HomeProps) {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-cream)]/40">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <HomeLine
            nowrap="md"
            className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]"
          >
            {t.peopleEyebrow}
          </HomeLine>
          <HomeLine
            as="h2"
            nowrap="lg"
            className="mt-3 text-3xl font-medium tracking-tight md:text-4xl"
          >
            {t.peopleTitle}
          </HomeLine>
          <HomeLines
            lines={t.peopleBody}
            nowrap="xl"
            className="mt-6 space-y-2"
            itemClassName="leading-relaxed text-[var(--color-ink-muted)]"
          />
          <Link
            href={localizedPath(locale, "/people")}
            className={`${ctaPrimaryClass} mt-8`}
          >
            {t.peopleCta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function HomePartner({ locale, t }: HomeProps) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
      <Reveal>
        <HomeLine
          nowrap="md"
          className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]"
        >
          {t.partnerEyebrow}
        </HomeLine>
        <HomeLine
          as="h2"
          nowrap="md"
          className="mt-3 text-3xl font-medium tracking-tight md:text-4xl"
        >
          {t.partnerTitle}
        </HomeLine>
        <HomeLines
          lines={t.partnerBody}
          nowrap="xl"
          className="mt-5 space-y-2"
          itemClassName="text-[var(--color-ink-muted)]"
        />
        <Link
          href={localizedPath(locale, "/contact")}
          className={`${ctaPrimaryClass} mt-8`}
        >
          {t.partnerCta}
        </Link>
      </Reveal>
    </section>
  );
}

export function HomeFinalCta({
  locale,
  t,
  linkedin,
  openchat,
}: HomeProps & { linkedin?: string; openchat?: string }) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-dark)] text-[var(--color-cream)]">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <HomeLine
            as="h2"
            nowrap="lg"
            className="text-3xl font-medium tracking-tight md:text-4xl"
          >
            {t.finalTitle}
          </HomeLine>
          <HomeLines
            lines={t.finalBody}
            nowrap="lg"
            className="mt-5 space-y-1"
            itemClassName="text-[color-mix(in_srgb,var(--color-cream)_70%,transparent)]"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, "/meetups")}
              className={ctaPrimaryClass}
            >
              {t.ctaMeetups}
            </Link>
            <a
              href={linkedin || CHAPTER_LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 ${ctaSecondaryClass}`}
            >
              <LinkedinLogo size={18} weight="fill" aria-hidden />
              {t.ctaLinkedin}
            </a>
            <a
              href={openchat || CHAPTER_OPENCHAT_URL}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 ${ctaSecondaryClass}`}
            >
              <ChatTeardropText size={18} weight="fill" aria-hidden />
              {t.ctaOpenchat}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
