import Image from "next/image";
import {
  Compass,
  Globe,
  Handshake,
  LinkedinLogo,
  Sparkle,
  Wrench,
} from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import type { PeopleIntroCopy } from "@/lib/people/intro";

type Member = {
  id: string;
  nameKr: string;
  nameEn: string;
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

const ROLE_ICONS = [Compass, Wrench, Sparkle, Handshake] as const;

function ProfileLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
    >
      {children}
    </a>
  );
}

export function PeopleGrid({
  locale,
  t,
  members,
  intro,
}: {
  locale: Locale;
  t: Messages["people"];
  members: Member[];
  intro: PeopleIntroCopy;
}) {
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
            {t.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-[55ch] text-[var(--color-ink-muted)]">
            {t.lead}
          </p>
        </Reveal>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
              {t.manifestoEyebrow}
            </p>
            <div className="mt-6 max-w-[40rem] space-y-3">
              {intro.manifesto.map((line) => (
                <p
                  key={line}
                  className="text-xl font-medium leading-snug tracking-tight text-[var(--color-ink)] md:text-2xl md:leading-snug"
                >
                  {line}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
            {t.rolesEyebrow}
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intro.roles.map((role, i) => {
            const Icon = ROLE_ICONS[i] ?? Compass;
            return (
              <Reveal key={`${role.title}-${i}`} delay={0.05 * i}>
                <article className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-cream)]/50 px-5 py-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-stone)] text-[var(--color-gold)]">
                    <Icon size={20} weight="duotone" aria-hidden />
                  </span>
                  <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-sm tracking-wide text-[var(--color-ink-muted)]">
                    {role.title}
                  </h2>
                  <p className="mt-2 text-base font-medium leading-snug">
                    {role.lead}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {role.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-[48ch] text-[var(--color-ink-muted)]">
            {intro.bridge}
          </p>
        </Reveal>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-cream)]/30">
        <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
              {t.membersEyebrow}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
            {members.map((m, i) => {
              const displayName =
                locale === "en" && m.nameEn ? m.nameEn : m.nameKr;
              const secondaryName = locale === "en" ? m.nameKr : m.nameEn;
              const hasLinks = Boolean(m.linkedinUrl || m.websiteUrl);
              return (
                <Reveal key={m.id} delay={(i % 4) * 0.04}>
                  <article className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
                      {m.photoUrl ? (
                        <Image
                          src={m.photoUrl}
                          alt={displayName}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width:768px) 50vw, 25vw"
                        />
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-lg font-medium">{displayName}</h3>
                    {secondaryName ? (
                      <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[var(--color-ink-muted)]">
                        {secondaryName}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                      {m.bio}
                    </p>
                    {hasLinks ? (
                      <div className="mt-4 flex items-center gap-2">
                        {m.linkedinUrl ? (
                          <ProfileLink
                            href={m.linkedinUrl}
                            label={`${displayName} LinkedIn`}
                          >
                            <LinkedinLogo size={18} weight="fill" />
                          </ProfileLink>
                        ) : null}
                        {m.websiteUrl ? (
                          <ProfileLink
                            href={m.websiteUrl}
                            label={`${displayName} website`}
                          >
                            <Globe size={18} weight="regular" />
                          </ProfileLink>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-14 max-w-[48ch] border-t border-[var(--color-border)] pt-8 text-[var(--color-ink-muted)]">
              {intro.closing}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
