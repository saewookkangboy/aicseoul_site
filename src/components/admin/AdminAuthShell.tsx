import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
};

export function AdminAuthShell({ children, title, description, footer }: Props) {
  return (
    <div className="grid min-h-[100dvh] bg-[var(--color-stone)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[var(--color-dark)] text-[var(--color-surface)] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 20%, color-mix(in srgb, var(--color-gold) 35%, transparent), transparent 60%), radial-gradient(ellipse 55% 45% at 85% 80%, color-mix(in srgb, var(--color-cta) 22%, transparent), transparent 55%)",
          }}
        />
        <div className="relative">
          <Link href="/" className="inline-block">
            <p className="font-display text-[11px] tracking-[0.18em] text-[var(--color-gold)]">
              AIC SEOUL
            </p>
            <p className="mt-3 max-w-[12ch] font-display text-4xl font-medium leading-[1.1] tracking-tight text-white xl:text-5xl">
              Admin Console
            </p>
          </Link>
          <p className="mt-6 max-w-[32ch] text-sm leading-relaxed text-[var(--color-surface)]/60">
            챕터 콘텐츠와 문의, 권한을 한곳에서 운영합니다.
          </p>
        </div>
        <p className="relative text-xs text-[var(--color-surface)]/40">
          SuperAdmin 승인 후 모듈 권한이 부여됩니다.
        </p>
      </aside>

      <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-block font-display text-[11px] tracking-[0.16em] text-[var(--color-gold)] lg:hidden"
          >
            AIC SEOUL
          </Link>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {description}
          </p>
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-8 text-sm text-[var(--color-ink-muted)]">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
