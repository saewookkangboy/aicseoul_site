"use client";

import { useState, useTransition } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  AdminPanel,
  btnPrimaryClass,
  errorTextClass,
  fieldClass,
  labelClass,
  labelHintClass,
} from "@/components/admin/ui";
import {
  changePassword,
  updateAccountProfile,
  updateLinkedMemberProfile,
} from "@/lib/actions/account";

type AccountMember = {
  nameKr: string;
  nameEn: string;
  bio: string;
  photoUrl: string | null;
  photoAssetId: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

type AccountFormsProps = {
  email: string;
  name: string | null;
  member: AccountMember | null;
};

type FormResult = { error: string | null; success: string | null };

const emptyResult: FormResult = { error: null, success: null };

export function AccountForms({ email, name, member }: AccountFormsProps) {
  const [pending, start] = useTransition();
  const [profileResult, setProfileResult] = useState<FormResult>(emptyResult);
  const [passwordResult, setPasswordResult] =
    useState<FormResult>(emptyResult);
  const [memberResult, setMemberResult] = useState<FormResult>(emptyResult);
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl ?? "");
  const [photoAssetId, setPhotoAssetId] = useState(member?.photoAssetId ?? "");

  return (
    <div className="flex flex-col gap-6">
      <AdminPanel
        title="계정"
        description="로그인 이메일과 Admin에 표시되는 이름을 관리합니다."
      >
        <form
          className="flex max-w-xl flex-col gap-4"
          action={(fd) => {
            start(async () => {
              setProfileResult(emptyResult);
              const result = await updateAccountProfile(fd);
              if (!result.ok) {
                setProfileResult({ error: result.error, success: null });
                return;
              }
              setProfileResult({
                error: null,
                success: "표시 이름을 저장했습니다.",
              });
            });
          }}
        >
          <label className={labelClass}>
            <span className={labelHintClass}>이메일</span>
            <input
              name="email"
              type="email"
              readOnly
              value={email}
              className={`${fieldClass} bg-[var(--color-cream)]/50`}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>표시 이름</span>
            <input
              name="name"
              required
              defaultValue={name ?? ""}
              className={fieldClass}
              disabled={pending}
            />
          </label>
          {profileResult.error ? (
            <p className={errorTextClass} role="alert">
              {profileResult.error}
            </p>
          ) : null}
          {profileResult.success ? (
            <p className="text-sm text-[var(--color-ink-muted)]" role="status">
              {profileResult.success}
            </p>
          ) : null}
          <button
            type="submit"
            className={`${btnPrimaryClass} mt-2 w-fit`}
            disabled={pending}
          >
            이름 저장
          </button>
        </form>
      </AdminPanel>

      <AdminPanel
        title="비밀번호"
        description="현재 비밀번호 확인 후 새 비밀번호로 변경합니다."
      >
        <form
          className="flex max-w-xl flex-col gap-4"
          action={(fd) => {
            start(async () => {
              setPasswordResult(emptyResult);
              const result = await changePassword(fd);
              if (!result.ok) {
                setPasswordResult({ error: result.error, success: null });
                return;
              }
              setPasswordResult({
                error: null,
                success: "비밀번호를 변경했습니다.",
              });
            });
          }}
        >
          <label className={labelClass}>
            <span className={labelHintClass}>현재 비밀번호</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={fieldClass}
              disabled={pending}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>새 비밀번호</span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              className={fieldClass}
              disabled={pending}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>새 비밀번호 확인</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              className={fieldClass}
              disabled={pending}
            />
          </label>
          {passwordResult.error ? (
            <p className={errorTextClass} role="alert">
              {passwordResult.error}
            </p>
          ) : null}
          {passwordResult.success ? (
            <p className="text-sm text-[var(--color-ink-muted)]" role="status">
              {passwordResult.success}
            </p>
          ) : null}
          <button
            type="submit"
            className={`${btnPrimaryClass} mt-2 w-fit`}
            disabled={pending}
          >
            비밀번호 변경
          </button>
        </form>
      </AdminPanel>

      <AdminPanel
        title="People 소개"
        description="공개 People 페이지에 표시되는 소개를 수정합니다."
      >
        {member ? (
          <form
            className="flex max-w-xl flex-col gap-4"
            action={(fd) => {
              start(async () => {
                setMemberResult(emptyResult);
                const result = await updateLinkedMemberProfile(fd);
                if (!result.ok) {
                  setMemberResult({ error: result.error, success: null });
                  return;
                }
                setMemberResult({
                  error: null,
                  success: "People 소개를 저장했습니다.",
                });
              });
            }}
          >
            <input type="hidden" name="photoUrl" value={photoUrl} />
            <input type="hidden" name="photoAssetId" value={photoAssetId} />
            <ImageUploadField
              module="account"
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
                defaultValue={member.nameKr}
                className={fieldClass}
                disabled={pending}
              />
            </label>
            <label className={labelClass}>
              <span className={labelHintClass}>영문명</span>
              <input
                name="nameEn"
                required
                defaultValue={member.nameEn}
                className={fieldClass}
                disabled={pending}
              />
            </label>
            <label className={labelClass}>
              <span className={labelHintClass}>한 줄 소개 (권장 25자 내외)</span>
              <input
                name="bio"
                required
                maxLength={80}
                defaultValue={member.bio}
                className={fieldClass}
                disabled={pending}
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
                  defaultValue={member.linkedinUrl ?? ""}
                  className={fieldClass}
                  disabled={pending}
                />
              </label>
              <label className={labelClass}>
                <span className={labelHintClass}>웹사이트 / 개인 사이트 URL</span>
                <input
                  name="websiteUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={member.websiteUrl ?? ""}
                  className={fieldClass}
                  disabled={pending}
                />
              </label>
            </fieldset>
            {memberResult.error ? (
              <p className={errorTextClass} role="alert">
                {memberResult.error}
              </p>
            ) : null}
            {memberResult.success ? (
              <p
                className="text-sm text-[var(--color-ink-muted)]"
                role="status"
              >
                {memberResult.success}
              </p>
            ) : null}
            <button
              type="submit"
              className={`${btnPrimaryClass} mt-2 w-fit`}
              disabled={pending}
            >
              소개 저장
            </button>
          </form>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)]">
            People 프로필이 연결되지 않았습니다. SuperAdmin에게 문의해 주세요.
          </p>
        )}
      </AdminPanel>
    </div>
  );
}
