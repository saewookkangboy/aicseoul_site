import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { homeCopy } from "@/lib/content/copy";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-dark)] text-[var(--color-cream)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-center px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.22em] text-[var(--color-gold)]">
            {homeCopy.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-[14em] whitespace-pre-line text-4xl font-medium leading-[1.2] tracking-tight md:text-6xl lg:text-7xl">
            {homeCopy.headline}
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-5 max-w-[36em] font-[family-name:var(--font-space-grotesk)] text-base text-[color-mix(in_srgb,var(--color-cream)_72%,transparent)] md:text-lg">
            {homeCopy.headlineEn}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-[36em] text-base leading-relaxed text-[color-mix(in_srgb,var(--color-cream)_78%,transparent)] md:text-lg">
            {homeCopy.body}
          </p>
          <p className="mt-4 max-w-[32em] text-sm text-[color-mix(in_srgb,var(--color-cream)_55%,transparent)]">
            {homeCopy.aux}
          </p>
        </Reveal>
        <Reveal delay={0.28}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/meetups"
              className="rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white"
            >
              다음 모임 보기
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[color-mix(in_srgb,var(--color-cream)_28%,transparent)] px-6 py-3 text-sm text-[var(--color-cream)]"
            >
              문의하기
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HomeStats({
  members,
  cities,
  countries,
}: {
  members: string;
  cities: string;
  countries: string;
}) {
  const stats = [
    { value: members, label: "멤버" },
    { value: cities, label: "도시" },
    { value: countries, label: "개국" },
  ];

  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-28">
      <Reveal>
        <h2 className="whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
          {homeCopy.globalTitle}
        </h2>
        <p className="mt-5 max-w-[36em] text-base leading-relaxed text-[var(--color-ink-muted)]">
          {homeCopy.globalBody}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-medium md:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs tracking-wide text-[var(--color-ink-muted)]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export function HomeReasons() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
            {homeCopy.whyEyebrow}
          </p>
          <h2 className="mt-3 whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
            {homeCopy.whyTitle}
          </h2>
          <p className="mt-5 max-w-[38em] text-[var(--color-ink-muted)]">
            {homeCopy.whyLead}
          </p>
          <p className="mt-3 max-w-[38em] text-[var(--color-ink-muted)]">
            {homeCopy.whyBody}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {homeCopy.reasons.map((r, i) => (
            <Reveal key={r.title} delay={0.06 * i}>
              <div className="border-t border-[var(--color-gold)] pt-5">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg tracking-wide">
                  {r.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {r.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeActivities() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          {homeCopy.whatEyebrow}
        </p>
        <h2 className="mt-3 whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
          {homeCopy.whatTitle}
        </h2>
        <p className="mt-5 max-w-[38em] text-[var(--color-ink-muted)]">
          {homeCopy.whatLead}
        </p>
      </Reveal>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {homeCopy.activities.map((a, i) => (
          <Reveal key={a.title} delay={0.06 * i}>
            <article className="flex h-full flex-col border-t border-[var(--color-border)] pt-6">
              <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-wide text-[var(--color-ink-muted)]">
                {a.tag}
              </p>
              <h3 className="mt-3 text-xl font-medium">{a.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {a.body}
              </p>
              <Link
                href={a.href}
                className="mt-6 text-sm text-[var(--color-cta)]"
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

export function HomePeopleTeaser() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-cream)]/40">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <h2 className="max-w-[14em] whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
            {homeCopy.peopleTitle}
          </h2>
          <p className="mt-6 max-w-[38em] leading-relaxed text-[var(--color-ink-muted)]">
            {homeCopy.peopleBody}
          </p>
          <Link
            href="/people"
            className="mt-8 inline-block text-sm text-[var(--color-cta)]"
          >
            운영진 만나보기 →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function HomePartner() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          {homeCopy.partnerEyebrow}
        </p>
        <h2 className="mt-3 whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
          {homeCopy.partnerTitle}
        </h2>
        <p className="mt-5 max-w-[38em] text-[var(--color-ink-muted)]">
          {homeCopy.partnerBody}
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white"
        >
          파트너십 문의하기
        </Link>
      </Reveal>
    </section>
  );
}

export function HomeFinalCta({ linkedin }: { linkedin?: string }) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-dark)] text-[var(--color-cream)]">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <h2 className="max-w-[14em] whitespace-pre-line text-3xl font-medium leading-snug tracking-tight md:text-4xl">
            {homeCopy.finalTitle}
          </h2>
          <p className="mt-5 max-w-[32em] text-[color-mix(in_srgb,var(--color-cream)_70%,transparent)]">
            {homeCopy.finalBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/meetups"
              className="rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white"
            >
              다음 모임 보기
            </Link>
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[color-mix(in_srgb,var(--color-cream)_28%,transparent)] px-6 py-3 text-sm"
              >
                링크드인 팔로우
              </a>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
