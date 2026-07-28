"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    title?: string;
    date?: string;
    headcount?: number | null;
    summary?: string | null;
    quote1?: string;
    quote2?: string;
    status?: "draft" | "published";
    photos?: string[];
  };
  submitLabel: string;
};

export function ClassForm({ action, initial, submitLabel }: Props) {
  const [photos, setPhotos] = useState<string[]>([
    initial?.photos?.[0] ?? "",
    initial?.photos?.[1] ?? "",
    initial?.photos?.[2] ?? "",
  ]);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      <input type="hidden" name="photo1" value={photos[0]} />
      <input type="hidden" name="photo2" value={photos[1]} />
      <input type="hidden" name="photo3" value={photos[2]} />
      <label className="flex flex-col gap-1 text-sm">
        <span>제목</span>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>진행일</span>
        <input
          name="date"
          type="date"
          required
          defaultValue={initial?.date}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>참가 인원</span>
        <input
          name="headcount"
          type="number"
          min={1}
          defaultValue={initial?.headcount ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>요약</span>
        <textarea
          name="summary"
          rows={3}
          defaultValue={initial?.summary ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>후기 1</span>
        <input
          name="quote1"
          defaultValue={initial?.quote1 ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>후기 2</span>
        <input
          name="quote2"
          defaultValue={initial?.quote2 ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>상태</span>
        <select
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        >
          <option value="draft">초안</option>
          <option value="published">발행</option>
        </select>
      </label>
      {[0, 1, 2].map((i) => (
        <ImageUploadField
          key={i}
          module="meetups"
          folder="classes"
          value={photos[i]}
          label={`현장 사진 ${i + 1}`}
          onUploaded={(url) => {
            setPhotos((prev) => {
              const next = [...prev];
              next[i] = url;
              return next;
            });
          }}
        />
      ))}
      <button
        type="submit"
        className="mt-2 w-fit rounded-full bg-[var(--color-cta)] px-5 py-2.5 text-sm text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
