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
        {members.map((m, i) => (
          <Reveal key={m.id} delay={(i % 4) * 0.04}>
            <article>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]">
                {m.photoUrl ? (
                  <Image
                    src={m.photoUrl}
                    alt={`${m.nameKr} 프로필`}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                ) : null}
              </div>
              <h2 className="mt-4 text-lg font-medium">{m.nameKr}</h2>
              <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[var(--color-ink-muted)]">
                {m.nameEn}
              </p>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{m.bio}</p>
              <div className="mt-3 flex gap-3">
                {m.linkedinUrl ? (
                  <a
                    href={m.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.nameKr} LinkedIn`}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    <LinkedinLogo size={18} weight="regular" />
                  </a>
                ) : null}
                {m.websiteUrl ? (
                  <a
                    href={m.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.nameKr} 웹사이트`}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    <Globe size={18} weight="regular" />
                  </a>
                ) : null}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
