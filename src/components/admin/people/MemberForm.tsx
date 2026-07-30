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
    nameKr?: string;
    nameEn?: string;
    bio?: string;
    photoUrl?: string | null;
    photoAssetId?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
    isVisible?: boolean;
    isFounder?: boolean;
  };
  submitLabel: string;
};

export function MemberForm({ action, initial, submitLabel }: Props) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [photoAssetId, setPhotoAssetId] = useState(initial?.photoAssetId ?? "");

  return (
    <AdminPanel>
      <form action={action} className="flex max-w-xl flex-col gap-4">
        <input type="hidden" name="photoUrl" value={photoUrl} />
        <input type="hidden" name="photoAssetId" value={photoAssetId} />
        <ImageUploadField
          module="people"
          folder="people"
          value={photoUrl}
          cropMode="face-3x4"
          onUploaded={setPhotoUrl}
          onUploadedMeta={(meta) => {
            setPhotoUrl(meta.url);
            setPhotoAssetId(meta.assetId);
          }}
          label="사진 (3:4, 얼굴 중앙 자동 정렬)"
        />
        <label className={labelClass}>
          <span className={labelHintClass}>한글명</span>
          <input
            name="nameKr"
            required
            defaultValue={initial?.nameKr}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>영문명</span>
          <input
            name="nameEn"
            required
            defaultValue={initial?.nameEn}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelHintClass}>한 줄 소개 (권장 25자 내외)</span>
          <input
            name="bio"
            required
            maxLength={80}
            defaultValue={initial?.bio}
            className={fieldClass}
          />
        </label>
        <fieldset className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-cream)]/40 p-4">
          <legend className="px-1 text-sm font-medium">프로필 링크</legend>
          <p className="text-xs text-[var(--color-ink-muted)]">
            입력한 주소는 People 페이지에 LinkedIn·웹 아이콘으로 노출됩니다.
          </p>
          <label className={labelClass}>
            <span className={labelHintClass}>LinkedIn URL</span>
            <input
              name="linkedinUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/..."
              defaultValue={initial?.linkedinUrl ?? ""}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>웹사이트 / 개인 사이트 URL</span>
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://..."
              defaultValue={initial?.websiteUrl ?? ""}
              className={fieldClass}
            />
          </label>
        </fieldset>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={initial?.isVisible ?? true}
            className="accent-[var(--color-cta)]"
          />
          퍼블릭 노출
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFounder"
            defaultChecked={initial?.isFounder ?? false}
            className="accent-[var(--color-cta)]"
          />
          내부 참고: 창립자
        </label>
        <button type="submit" className={`${btnPrimaryClass} mt-2 w-fit`}>
          {submitLabel}
        </button>
      </form>
    </AdminPanel>
  );
}
