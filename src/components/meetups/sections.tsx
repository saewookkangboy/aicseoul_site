import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { formatDateKo, meetupsCopy } from "@/lib/content/copy";

export function MeetupsIntro() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          Meetups
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
          {meetupsCopy.title}
        </h1>
        <p className="mt-5 max-w-[60ch] text-[var(--color-ink-muted)]">
          {meetupsCopy.intro}
        </p>
      </Reveal>
    </section>
  );
}

export function MonthlyFormat({ ctaUrl }: { ctaUrl: string }) {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
            Monthly Meetup
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">
            {meetupsCopy.monthlyTitle}
          </h2>
          <p className="mt-4 max-w-[60ch] text-[var(--color-ink-muted)]">
            {meetupsCopy.monthlyLead}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {meetupsCopy.steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-2 text-sm">
                  {step}
                </span>
                {i < meetupsCopy.steps.length - 1 ? (
                  <span className="text-[var(--color-ink-muted)]" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <Link
            href={ctaUrl}
            className="mt-10 inline-flex rounded-full bg-[var(--color-cta)] px-6 py-3 text-sm font-medium text-white"
          >
            다음 모임 신청하기 →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

type ClassMeetup = {
  title: string;
  date: Date;
  headcount: number | null;
  summary: string | null;
  testimonials: unknown;
  photos: { imageUrl: string }[];
};

export function ClassHighlight({ meetup }: { meetup: ClassMeetup | null }) {
  const quotes = Array.isArray(meetup?.testimonials)
    ? (meetup!.testimonials as string[])
    : [];

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          One-day Class
        </p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight">
          {meetupsCopy.classTitle}
        </h2>
        <p className="mt-4 max-w-[60ch] text-[var(--color-ink-muted)]">
          {meetupsCopy.classLead}
        </p>
      </Reveal>

      {meetup ? (
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-xs tracking-wide text-[var(--color-ink-muted)]">
              지난 클래스 · 기록
            </p>
            <h3 className="mt-2 text-2xl font-medium">{meetup.title}</h3>
            <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-sm text-[var(--color-ink-muted)]">
              {formatDateKo(meetup.date)}
              {meetup.headcount ? ` · ${meetup.headcount}명` : ""}
            </p>
            {meetup.summary ? (
              <p className="mt-4 text-[var(--color-ink-muted)]">{meetup.summary}</p>
            ) : null}
            {quotes[0] ? (
              <blockquote className="mt-6 border-l-2 border-[var(--color-gold)] pl-4 text-[var(--color-ink)]">
                “{quotes[0]}”
              </blockquote>
            ) : null}
            <Link
              href="/contact"
              className="mt-8 inline-block text-sm text-[var(--color-cta)]"
            >
              다음 클래스 문의하기 →
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-3">
              {meetup.photos.slice(0, 2).map((p) => (
                <div
                  key={p.imageUrl}
                  className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-[var(--color-border)]"
                >
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      ) : (
        <p className="mt-10 text-[var(--color-ink-muted)]">
          아직 등록된 클래스 기록이 없습니다.
        </p>
      )}
    </section>
  );
}

export function PhotoWall({
  photos,
}: {
  photos: { id: string; imageUrl: string }[];
}) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <h2 className="text-3xl font-medium tracking-tight">
            {meetupsCopy.archiveTitle}
          </h2>
        </Reveal>
        {photos.length === 0 ? (
          <p className="mt-8 text-[var(--color-ink-muted)]">사진이 아직 없습니다.</p>
        ) : (
          <div className="mt-10 columns-2 gap-3 md:columns-3 lg:columns-4">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="relative mb-3 break-inside-avoid overflow-hidden rounded-lg bg-[var(--color-border)]"
              >
                <Image
                  src={p.imageUrl}
                  alt=""
                  width={600}
                  height={i % 3 === 0 ? 800 : 500}
                  className="h-auto w-full object-cover"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
