"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  AdminPanel,
  btnPrimaryClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";

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
    <AdminPanel>
      <form action={action} className="flex max-w-2xl flex-col gap-4">
        <input type="hidden" name="photo1" value={photos[0]} />
        <input type="hidden" name="photo2" value={photos[1]} />
        <input type="hidden" name="photo3" value={photos[2]} />
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
          <span className={labelHintClass}>진행일</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={initial?.date}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>참가 인원</span>
          <input
            name="headcount"
            type="number"
            min={1}
            defaultValue={initial?.headcount ?? ""}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>요약</span>
          <textarea
            name="summary"
            rows={3}
            defaultValue={initial?.summary ?? ""}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>후기 1</span>
          <input
            name="quote1"
            defaultValue={initial?.quote1 ?? ""}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>후기 2</span>
          <input
            name="quote2"
            defaultValue={initial?.quote2 ?? ""}
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
        <button type="submit" className={`${btnPrimaryClass} mt-2 w-fit`}>
          {submitLabel}
        </button>
      </form>
    </AdminPanel>
  );
}
