"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const CATEGORIES = ["Meetup Recap", "Class Note", "Community"] as const;

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    title?: string;
    category?: string;
    summary?: string;
    body?: string;
    thumbnailUrl?: string | null;
    author?: string;
    publishedAt?: string;
    status?: "draft" | "published";
    isFeatured?: boolean;
  };
  submitLabel: string;
};

export function InsightForm({ action, initial, submitLabel }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
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
        <span>카테고리</span>
        <input
          name="category"
          list="insight-categories"
          required
          defaultValue={initial?.category ?? "Community"}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
        <datalist id="insight-categories">
          {CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>요약</span>
        <textarea
          name="summary"
          required
          rows={2}
          defaultValue={initial?.summary}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>본문 (마크다운)</span>
        <textarea
          name="body"
          required
          rows={12}
          defaultValue={initial?.body}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm"
        />
      </label>
      <ImageUploadField
        module="insights"
        folder="insights"
        value={thumbnailUrl}
        onUploaded={setThumbnailUrl}
        label="썸네일 (선택)"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span>작성자</span>
        <input
          name="author"
          defaultValue={initial?.author ?? "AIC Seoul"}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>발행일</span>
        <input
          name="publishedAt"
          type="date"
          defaultValue={initial?.publishedAt}
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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={initial?.isFeatured}
        />
        Featured (대표글 — 기존 Featured는 자동 해제)
      </label>
      <button
        type="submit"
        className="mt-2 w-fit rounded-full bg-[var(--color-cta)] px-5 py-2.5 text-sm text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
