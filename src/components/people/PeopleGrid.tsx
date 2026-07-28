import Image from "next/image";
import { LinkedinLogo, Globe } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/motion/Reveal";

type Member = {
  id: string;
  nameKr: string;
  nameEn: string;
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

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

export function PeopleGrid({ members }: { members: Member[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          People
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
          함께 만드는 사람들
        </h1>
        <p className="mt-5 max-w-[55ch] text-[var(--color-ink-muted)]">
          AIC 서울 챕터의 운영진은 가장 먼저 움직이는 멤버입니다. 역할 라벨 없이,
          사람 그 자체로 소개합니다.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
        {members.map((m, i) => {
          const hasLinks = Boolean(m.linkedinUrl || m.websiteUrl);
          return (
            <Reveal key={m.id} delay={(i % 4) * 0.04}>
              <article className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
                  {m.photoUrl ? (
                    <Image
                      src={m.photoUrl}
                      alt={`${m.nameKr} 프로필`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                  ) : null}
                </div>
                <h2 className="mt-4 text-lg font-medium">{m.nameKr}</h2>
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[var(--color-ink-muted)]">
                  {m.nameEn}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {m.bio}
                </p>
                {hasLinks ? (
                  <div className="mt-4 flex items-center gap-2">
                    {m.linkedinUrl ? (
                      <ProfileLink
                        href={m.linkedinUrl}
                        label={`${m.nameKr} LinkedIn`}
                      >
                        <LinkedinLogo size={18} weight="fill" />
                      </ProfileLink>
                    ) : null}
                    {m.websiteUrl ? (
                      <ProfileLink
                        href={m.websiteUrl}
                        label={`${m.nameKr} 웹사이트`}
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
    </section>
  );
}
