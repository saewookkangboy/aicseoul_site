"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { InsightBodyPreview } from "@/components/admin/insights/InsightBodyPreview";
import { RichTextEditor } from "@/components/admin/insights/RichTextEditor";
import {
  AdminPanel,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
import { looksLikeHtml } from "@/lib/sanitize-html";

const CATEGORIES = ["Meetup Recap", "Class Note", "Community"] as const;
const PREVIEW_DEBOUNCE_MS = 200;

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

/** 기존 마크다운 시드를 TipTap HTML로 가볍게 감쌈 */
function bodyToEditorHtml(body?: string): string {
  if (!body?.trim()) return "";
  if (looksLikeHtml(body)) return body;
  return body
    .split(/\n\n+/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return "";
      return `<p>${lines.join("<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export function InsightForm({ action, initial, submitLabel }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const initialBodyHtml = bodyToEditorHtml(initial?.body);
  const [liveHtml, setLiveHtml] = useState(initialBodyHtml);
  const [previewHtml, setPreviewHtml] = useState(initialBodyHtml);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPreviewHtml(liveHtml);
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [liveHtml]);

  const tabBtn = (pane: "edit" | "preview", label: string) => (
    <button
      type="button"
      onClick={() => setMobilePane(pane)}
      aria-pressed={mobilePane === pane}
      className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
        mobilePane === pane
          ? "bg-[var(--color-ink)] text-white"
          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <AdminPanel>
      <div className="mb-4 flex gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1 lg:hidden">
        {tabBtn("edit", "작성")}
        {tabBtn("preview", "미리보기")}
      </div>

      <form
        action={action}
        className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8"
      >
        <div
          className={`flex flex-col gap-4 ${
            mobilePane === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
          <label className={labelClass}>
            <span className={labelHintClass}>제목</span>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>카테고리</span>
            <input
              name="category"
              list="insight-categories"
              required
              defaultValue={initial?.category ?? "Community"}
              className={fieldClass}
            />
            <datalist id="insight-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>요약</span>
            <textarea
              name="summary"
              required
              rows={2}
              defaultValue={initial?.summary}
              className={fieldClass}
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className={labelHintClass}>본문</span>
            <p className="text-xs text-[var(--color-ink-muted)]">
              위지윅 에디터로 작성합니다. 굵게·제목·목록·링크 등을 툴바에서
              사용할 수 있습니다. 우측(또는 미리보기 탭)에서 공개 본문과 같은
              미리보기를 확인하세요.
            </p>
            <RichTextEditor
              name="body"
              required
              initialHtml={initialBodyHtml}
              onHtmlChange={setLiveHtml}
            />
          </div>
          <ImageUploadField
            module="insights"
            folder="insights"
            value={thumbnailUrl}
            onUploaded={setThumbnailUrl}
            label="썸네일 (선택)"
          />
          <label className={labelClass}>
            <span className={labelHintClass}>작성자</span>
            <input
              name="author"
              defaultValue={initial?.author ?? "AIC Seoul"}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>발행일</span>
            <input
              name="publishedAt"
              type="date"
              defaultValue={initial?.publishedAt}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>상태</span>
            <select
              name="status"
              defaultValue={initial?.status ?? "draft"}
              className={fieldClass}
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
              className="accent-[var(--color-cta)]"
            />
            Featured (대표글 - 기존 Featured는 자동 해제)
          </label>
          <button type="submit" className={`${btnPrimaryClass} mt-2 w-fit`}>
            {submitLabel}
          </button>
        </div>

        <div
          className={`lg:sticky lg:top-6 ${
            mobilePane === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <InsightBodyPreview html={previewHtml} />
        </div>
      </form>
    </AdminPanel>
  );
}
