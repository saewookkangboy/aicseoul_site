import Link from "next/link";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { AuthForm } from "@/components/admin/AuthForm";
import { errorTextClass } from "@/components/admin/ui";
import { planExpireInvite } from "@/lib/admin-invite-plan";
import { hashInviteToken } from "@/lib/admin-invite-token";
import { getAdminSignupInviteCode } from "@/lib/admin-signup";
import { signupAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.status === "active") redirect("/admin");
  if (session?.user?.status === "pending") redirect("/admin/pending");

  const params = await searchParams;
  const rawToken = params.token?.trim();
  let inviteToken: string | undefined;
  let lockedEmail: string | undefined;
  let tokenError: string | undefined;

  if (rawToken) {
    const tokenHash = hashInviteToken(rawToken);
    const invite = await prisma.adminInvite.findUnique({ where: { tokenHash } });
    const now = new Date();

    if (!invite) {
      tokenError = "유효하지 않은 초대입니다.";
    } else if (planExpireInvite(invite.status, invite.expiresAt, now).expire) {
      await prisma.adminInvite.update({
        where: { id: invite.id },
        data: { status: "expired" },
      });
      tokenError = "초대가 만료되었습니다.";
    } else if (invite.status !== "pending") {
      tokenError = "유효하지 않은 초대입니다.";
    } else {
      inviteToken = rawToken;
      lockedEmail = invite.email;
    }
  }

  const requireInvite = Boolean(getAdminSignupInviteCode());
  const description = inviteToken
    ? "이메일 초대 링크로 접속하셨습니다. 초대된 이메일로만 가입할 수 있습니다."
    : requireInvite
      ? "운영진 계정은 가입 후 SuperAdmin 승인·권한 부여가 필요합니다. 초대 코드가 있는 분만 가입할 수 있습니다."
      : "운영진 계정은 가입 후 SuperAdmin 승인·권한 부여가 필요합니다.";

  return (
    <AdminAuthShell
      title="회원가입"
      description={description}
      footer={
        <p>
          이미 계정이 있나요?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-[var(--color-cta)] underline underline-offset-2"
          >
            로그인
          </Link>
        </p>
      }
    >
      {tokenError ? (
        <div
          className={`mb-4 rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 ${errorTextClass}`}
          role="alert"
        >
          <p>{tokenError}</p>
          <p className="mt-2 text-sm">
            초대 코드로{" "}
            <Link
              href="/admin/signup"
              className="font-medium text-[var(--color-cta)] underline underline-offset-2"
            >
              일반 가입
            </Link>
            을 이용할 수 있습니다.
          </p>
        </div>
      ) : null}
      <AuthForm
        action={signupAction}
        submitLabel="가입하기"
        includeName
        requireInvite={requireInvite}
        inviteToken={inviteToken}
        lockedEmail={lockedEmail}
      />
    </AdminAuthShell>
  );
}
