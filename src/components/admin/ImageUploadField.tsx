"use client";

import { useId, useState } from "react";
import { FaceCropModal } from "@/components/admin/people/FaceCropModal";
import {
  errorTextClass,
  fieldClass,
  labelHintClass,
} from "@/components/admin/ui";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  type UploadResult,
  uploadAdminImage,
  validateImageFile,
} from "@/lib/media/upload-client";

type Props = {
  module: "people" | "meetups" | "insights" | "settings";
  folder?: string;
  value?: string;
  onUploaded: (url: string) => void;
  onUploadedMeta?: (meta: UploadResult) => void;
  label?: string;
  cropMode?: "none" | "face-3x4";
};

export function ImageUploadField({
  module,
  folder,
  value,
  onUploaded,
  onUploadedMeta,
  label = "이미지 업로드",
  cropMode = "none",
}: Props) {
  const inputId = useId();
  const errorId = useId();
  const progressId = useId();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  async function uploadBlob(blob: Blob, filename: string) {
    setPending(true);
    setProgress(0);
    setError(null);
    try {
      const result = await uploadAdminImage({
        file: blob,
        module,
        folder,
        filename,
        onProgress: setProgress,
      });
      onUploaded(result.url);
      onUploadedMeta?.(result);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setPending(false);
    }
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      validateImageFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "유효하지 않은 파일");
      return;
    }

    if (cropMode === "face-3x4") {
      setCropFile(file);
      return;
    }

    await uploadBlob(file, file.name);
  }

  const accept = [...ALLOWED_IMAGE_MIME_TYPES].join(",");
  const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={`text-sm ${labelHintClass}`}>
        {label}
      </label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className={
            cropMode === "face-3x4"
              ? "aspect-[3/4] h-48 w-auto max-w-xs rounded-[var(--radius)] border border-[var(--color-border)] object-cover shadow-[var(--shadow-soft)]"
              : "h-40 w-auto max-w-xs rounded-[var(--radius)] border border-[var(--color-border)] object-cover shadow-[var(--shadow-soft)]"
          }
        />
      ) : (
        <div
          className={
            cropMode === "face-3x4"
              ? "flex aspect-[3/4] h-48 max-w-xs items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-cream)]/40 text-xs text-[var(--color-ink-muted)]"
              : "flex h-40 max-w-xs items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-cream)]/40 text-xs text-[var(--color-ink-muted)]"
          }
        >
          미리보기 없음
        </div>
      )}
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : pending ? progressId : undefined}
        aria-busy={pending}
        className={`${fieldClass} cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-cream)] file:px-3 file:py-1.5 file:text-xs file:font-medium`}
      />
      <p className="text-xs text-[var(--color-ink-muted)]">
        JPG/PNG · 최대 {maxMb}MB
      </p>
      {pending ? (
        <div className="flex max-w-xs flex-col gap-1" role="status" id={progressId}>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--color-cream)]"
            aria-hidden
          >
            <div
              className="h-full bg-[var(--color-cta)] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            업로드 중… {progress}%
          </p>
        </div>
      ) : null}
      {error ? (
        <p id={errorId} className={`text-xs ${errorTextClass}`} role="alert">
          {error}
        </p>
      ) : null}

      {cropFile ? (
        <FaceCropModal
          file={cropFile}
          open
          onCancel={() => setCropFile(null)}
          onCropped={async (blob) => {
            setCropFile(null);
            await uploadBlob(blob, "member-photo.jpg");
          }}
        />
      ) : null}
    </div>
  );
}
