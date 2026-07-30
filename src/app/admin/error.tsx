"use client";

import { useEffect } from "react";
import Link from "next/link";
import { btnPrimaryClass, btnSecondaryClass } from "@/components/admin/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col justify-center gap-4 px-6 py-12">
      <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--color-ink)]">
        작업을 완료하지 못했습니다
      </h1>
      <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
        잠시 후 다시 시도하거나 대시보드로 돌아가 주세요. 문제가 계속되면
        SuperAdmin에게 알려 주세요.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={btnPrimaryClass}>
          다시 시도
        </button>
        <Link href="/admin" className={btnSecondaryClass}>
          대시보드
        </Link>
      </div>
    </div>
  );
}
