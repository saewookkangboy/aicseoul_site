"use client";

import { useEffect } from "react";
import Link from "next/link";

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
      <h1 className="text-xl font-semibold">관리자 오류</h1>
      <p className="text-sm opacity-70">작업을 다시 시도하거나 대시보드로 돌아가 주세요.</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-2 text-sm"
        >
          다시 시도
        </button>
        <Link href="/admin" className="rounded-md border px-3 py-2 text-sm">
          대시보드
        </Link>
      </div>
    </div>
  );
}
