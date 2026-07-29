"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[locale]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">문제가 발생했습니다</h1>
      <p className="text-sm opacity-70">
        잠시 후 다시 시도해 주세요. 계속되면 운영진에게 알려 주세요.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[var(--aic-ink)] px-4 py-2 text-sm text-[var(--aic-stone)]"
        >
          다시 시도
        </button>
        <Link href="/ko" className="rounded-md border px-4 py-2 text-sm">
          홈으로
        </Link>
      </div>
    </div>
  );
}
