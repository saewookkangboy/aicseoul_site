"use client";

import { useState, useTransition } from "react";
import {
  cancelInvite,
  createInvite,
  resendInvite,
} from "@/lib/actions/invites";
import {
  applyPermissionPreset,
  type PermissionPresetId,
} from "@/lib/permission-presets";
import type { ModulePerms } from "@/lib/user-permission-update";
import { formatDateKo } from "@/lib/format-date";
import {
  AdminBadge,
  AdminPanel,
  btnDangerGhostClass,
  btnPrimaryClass,
  btnSecondaryClass,
  errorTextClass,
  fieldClass,
  labelClass,
  labelHintClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";

export type InviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  sendCount: number;
  lastSentAt: string;
};

const MODULE_FIELDS = [
  ["permPeople", "멤버"],
  ["permMeetups", "밋업"],
  ["permInsights", "인사이트"],
  ["permContact", "문의"],
  ["permSettings", "설정"],
] as const satisfies ReadonlyArray<[keyof ModulePerms, string]>;

const PRESET_BUTTONS = [
  { id: "content" as const, label: "콘텐츠만" },
  { id: "fullOps" as const, label: "전체 운영" },
  { id: "contactSettings" as const, label: "문의·설정" },
] satisfies ReadonlyArray<{ id: PermissionPresetId; label: string }>;

const actionBtnClass =
  "inline-flex min-h-10 items-center justify-start rounded-lg px-2 text-left text-sm font-medium outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]";

const presetBtnClass = `${btnSecondaryClass} min-h-8 px-3 py-1.5 text-xs`;

const EMPTY_PERMS: ModulePerms = {
  permPeople: false,
  permMeetups: false,
  permInsights: false,
  permContact: false,
  permSettings: false,
};

function roleLabel(role: string) {
  switch (role) {
    case "superadmin":
      return "슈퍼관리자";
    case "operator":
      return "운영자";
    default:
      return role;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "대기";
    case "accepted":
      return "수락";
    case "cancelled":
      return "취소";
    case "expired":
      return "만료";
    default:
      return status;
  }
}

function statusTone(status: string) {
  switch (status) {
    case "pending":
      return "warn" as const;
    case "accepted":
      return "success" as const;
    case "cancelled":
      return "neutral" as const;
    case "expired":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

function formatDateTimeKo(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function InvitePanel({ invites }: { invites: InviteRow[] }) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"superadmin" | "operator">("operator");
  const [perms, setPerms] = useState<ModulePerms>(EMPTY_PERMS);
  const [formError, setFormError] = useState<string | null>(null);
  const [latestUrl, setLatestUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [rowErrorById, setRowErrorById] = useState<Record<string, string>>({});

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFormError("클립보드 복사에 실패했습니다. 링크를 직접 선택해 복사해 주세요.");
    }
  };

  const submitInvite = () => {
    setFormError(null);
    setLatestUrl(null);
    setEmailSent(null);
    setCopied(false);

    start(async () => {
      const result = await createInvite({
        email,
        role,
        ...perms,
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setLatestUrl(result.signupUrl);
      setEmailSent(result.emailSent);
      setEmail("");
    });
  };

  const handleResend = (inviteId: string) => {
    setRowErrorById((prev) => {
      const next = { ...prev };
      delete next[inviteId];
      return next;
    });

    start(async () => {
      const result = await resendInvite(inviteId);
      if (!result.ok) {
        setRowErrorById((prev) => ({ ...prev, [inviteId]: result.error }));
        return;
      }
      setLatestUrl(result.signupUrl);
      setEmailSent(result.emailSent);
      setCopied(false);
    });
  };

  const handleCancel = (inviteId: string) => {
    setRowErrorById((prev) => {
      const next = { ...prev };
      delete next[inviteId];
      return next;
    });

    start(async () => {
      const result = await cancelInvite(inviteId);
      if (!result.ok) {
        setRowErrorById((prev) => ({ ...prev, [inviteId]: result.error }));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPanel
        title="이메일 초대"
        description="역할과(운영자) 모듈 권한을 지정해 가입 링크를 발송합니다. Resend 키가 없으면 링크를 복사해 전달하세요."
      >
        <div className="flex flex-col gap-4">
          <label className={labelClass}>
            <span className={labelHintClass}>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="admin@example.com"
              disabled={pending}
            />
          </label>
          <label className={labelClass}>
            <span className={labelHintClass}>역할</span>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "superadmin" | "operator")
              }
              className={fieldClass}
              disabled={pending}
            >
              <option value="operator">운영자</option>
              <option value="superadmin">슈퍼관리자</option>
            </select>
          </label>
          {role === "operator" ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[var(--color-ink-muted)]">
                모듈 권한
              </span>
              <div className="flex flex-wrap gap-1">
                {PRESET_BUTTONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={pending}
                    className={presetBtnClass}
                    onClick={() => setPerms(applyPermissionPreset(id))}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {MODULE_FIELDS.map(([name, label]) => (
                  <label
                    key={name}
                    className="flex min-h-10 items-center gap-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={perms[name]}
                      onChange={(e) =>
                        setPerms((prev) => ({
                          ...prev,
                          [name]: e.target.checked,
                        }))
                      }
                      disabled={pending}
                      className="size-4 accent-[var(--color-cta)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            disabled={pending || !email.trim()}
            className={`${btnPrimaryClass} w-fit`}
            onClick={submitInvite}
          >
            초대 보내기
          </button>
          {formError ? (
            <p className={errorTextClass} role="alert">
              {formError}
            </p>
          ) : null}
          {latestUrl ? (
            <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-cream)]/50 p-3">
              <p className="text-sm text-[var(--color-ink)]">
                가입 링크가 생성되었습니다.
              </p>
              {emailSent === false ? (
                <p className="text-xs text-[var(--color-ink-muted)]">
                  메일이 발송되지 않았습니다. 아래 링크를 복사해 전달해 주세요.
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 break-all text-xs text-[var(--color-ink-muted)]">
                  {latestUrl}
                </code>
                <button
                  type="button"
                  className={`${btnSecondaryClass} shrink-0`}
                  onClick={() => copyUrl(latestUrl)}
                >
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title="초대 목록" description={`최근 ${invites.length}건`}>
        {invites.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            아직 초대가 없습니다.
          </p>
        ) : (
          <div className={tableWrapClass}>
            <table className={`${tableClass} min-w-[720px]`}>
              <thead>
                <tr>
                  <th className={thClass}>이메일</th>
                  <th className={thClass}>역할</th>
                  <th className={thClass}>상태</th>
                  <th className={thClass}>만료</th>
                  <th className={thClass}>발송</th>
                  <th className={thClass}>액션</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const rowError = rowErrorById[invite.id];
                  return (
                    <tr key={invite.id} className="align-top">
                      <td className={tdClass}>
                        <div className="font-medium text-[var(--color-ink)]">
                          {invite.email}
                        </div>
                      </td>
                      <td className={tdClass}>
                        <AdminBadge tone="gold">
                          {roleLabel(invite.role)}
                        </AdminBadge>
                      </td>
                      <td className={tdClass}>
                        <AdminBadge tone={statusTone(invite.status)}>
                          {statusLabel(invite.status)}
                        </AdminBadge>
                      </td>
                      <td className={tdClass}>
                        <span className="text-[var(--color-ink-muted)]">
                          {formatDateKo(invite.expiresAt)}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className="text-[var(--color-ink-muted)]">
                          {invite.sendCount}회
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)]">
                          {formatDateTimeKo(invite.lastSentAt)}
                        </div>
                      </td>
                      <td className={tdClass}>
                        {invite.status === "pending" ? (
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              disabled={pending}
                              className={`${actionBtnClass} text-[var(--color-cta)]`}
                              onClick={() => handleResend(invite.id)}
                            >
                              재발송
                            </button>
                            <button
                              type="button"
                              disabled={pending}
                              className={`${btnDangerGhostClass} ${actionBtnClass}`}
                              onClick={() => handleCancel(invite.id)}
                            >
                              취소
                            </button>
                            {rowError ? (
                              <p
                                className={`text-xs ${errorTextClass}`}
                                role="alert"
                              >
                                {rowError}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-ink-muted)]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
