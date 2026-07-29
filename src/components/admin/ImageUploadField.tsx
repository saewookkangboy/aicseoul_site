"use client";

import { useState } from "react";
import { fieldClass, labelHintClass } from "@/components/admin/ui";

type Props = {
  module: "people" | "meetups" | "insights" | "settings";
  folder?: string;
  value?: string;
  onUploaded: (url: string) => void;
  label?: string;
};

export function ImageUploadField({
  module,
  folder,
  value,
  onUploaded,
  label = "이미지 업로드",
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("module", module);
      if (folder) fd.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={`text-sm ${labelHintClass}`}>{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-40 w-auto max-w-xs rounded-[var(--radius)] border border-[var(--color-border)] object-cover shadow-[var(--shadow-soft)]"
        />
      ) : (
        <div className="flex h-40 max-w-xs items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-cream)]/40 text-xs text-[var(--color-ink-muted)]">
          미리보기 없음
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onChange}
        disabled={pending}
        className={`${fieldClass} cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-cream)] file:px-3 file:py-1.5 file:text-xs file:font-medium`}
      />
      {pending ? (
        <p className="text-xs text-[var(--color-ink-muted)]">업로드 중…</p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-cta)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
