"use client";

import { useState, useTransition } from "react";
import {
  addArchivePhotosAction,
  deleteArchivePhotoAction,
} from "@/lib/actions/meetups";

type Photo = { id: string; imageUrl: string };

export function ArchiveManager({ photos }: { photos: Photo[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    start(async () => {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("module", "meetups");
        fd.set("folder", "archive");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "업로드 실패");
          return;
        }
        urls.push(data.url);
      }
      await addArchivePhotosAction(urls);
    });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-sm text-[var(--color-ink-muted)]">
          여러 장 업로드 (크롭 없음)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          disabled={pending}
          className="mt-2 block text-sm"
        />
        {pending ? (
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">처리 중…</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-xs text-[var(--color-cta)]">{error}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageUrl} alt="" className="aspect-square w-full object-cover" />
            <button
              type="button"
              className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
              onClick={() => start(() => deleteArchivePhotoAction(p.id))}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
