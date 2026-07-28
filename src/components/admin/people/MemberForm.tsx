"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    nameKr?: string;
    nameEn?: string;
    bio?: string;
    photoUrl?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
    isVisible?: boolean;
    isFounder?: boolean;
  };
  submitLabel: string;
};

export function MemberForm({ action, initial, submitLabel }: Props) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="photoUrl" value={photoUrl} />
      <ImageUploadField
        module="people"
        folder="people"
        value={photoUrl}
        onUploaded={setPhotoUrl}
        label="사진 (3:4 권장, 크롭 강제 없음)"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span>한글명</span>
        <input
          name="nameKr"
          required
          defaultValue={initial?.nameKr}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>영문명</span>
        <input
          name="nameEn"
          required
          defaultValue={initial?.nameEn}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>한 줄 소개 (권장 25자 내외)</span>
        <input
          name="bio"
          required
          maxLength={80}
          defaultValue={initial?.bio}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>LinkedIn URL</span>
        <input
          name="linkedinUrl"
          type="url"
          defaultValue={initial?.linkedinUrl ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>개인 사이트 URL</span>
        <input
          name="websiteUrl"
          type="url"
          defaultValue={initial?.websiteUrl ?? ""}
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={initial?.isVisible ?? true}
        />
        퍼블릭 노출
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isFounder"
          defaultChecked={initial?.isFounder ?? false}
        />
        내부 참고: 창립자
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
