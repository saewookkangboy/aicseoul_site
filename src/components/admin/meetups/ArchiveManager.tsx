"use client";

import { useState, useTransition } from "react";
import {
  addArchivePhotosAction,
  deleteArchivePhotoAction,
} from "@/lib/actions/meetups";
import { AdminEmpty, AdminPanel, fieldClass, labelHintClass } from "@/components/admin/ui";
import {
  MAX_UPLOAD_BYTES,
  uploadAdminImage,
  validateImageFile,
} from "@/lib/media/upload-client";

type Photo = { id: string; imageUrl: string };

export function ArchiveManager({ photos }: { photos: Photo[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    start(async () => {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        try {
          validateImageFile(file);
        } catch (err) {
          setError(err instanceof Error ? err.message : "유효하지 않은 파일");
          setProgressLabel(null);
          return;
        }
        try {
          setProgressLabel(
            `${i + 1}/${files.length} 업로드 중…`,
          );
          const result = await uploadAdminImage({
            file,
            module: "meetups",
            folder: "archive",
            onProgress: (pct) => {
              setProgressLabel(
                `${i + 1}/${files.length} 업로드 중… ${pct}%`,
              );
            },
          });
          urls.push(result.url);
        } catch (err) {
          setError(err instanceof Error ? err.message : "업로드 실패");
          setProgressLabel(null);
          return;
        }
      }
      setProgressLabel(null);
      await addArchivePhotosAction(urls);
    });
  }

  const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

  return (
    <div className="flex flex-col gap-6">
      <AdminPanel
        title="업로드"
        description={`여러 장 선택 가능 · JPG/PNG · 최대 ${maxMb}MB`}
      >
        <label className={`block text-sm ${labelHintClass}`}>
          이미지 파일
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={onFiles}
            disabled={pending}
            className={`${fieldClass} mt-2 cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-cream)] file:px-3 file:py-1.5 file:text-xs file:font-medium`}
          />
        </label>
        {pending || progressLabel ? (
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]" role="status">
            {progressLabel ?? "처리 중…"}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </AdminPanel>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-[var(--color-dark)]/70 px-3 py-1 text-xs text-white transition-[transform,opacity] hover:opacity-90 active:scale-[0.96] motion-reduce:transform-none"
                onClick={() => start(() => deleteArchivePhotoAction(p.id))}
                disabled={pending}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmpty
          title="사진이 없습니다"
          description="현장 사진을 업로드하면 공개 Meetup 아카이브에 표시됩니다."
        />
      )}
    </div>
  );
}
