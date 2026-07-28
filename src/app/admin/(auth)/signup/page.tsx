import Link from "next/link";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { AuthForm } from "@/components/admin/AuthForm";
import { getAdminSignupInviteCode } from "@/lib/admin-signup";
import { signupAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user?.status === "active") redirect("/admin");
  if (session?.user?.status === "pending") redirect("/admin/pending");

  const requireInvite = Boolean(getAdminSignupInviteCode());

  return (
    <AdminAuthShell
      title="회원가입"
      description={
        requireInvite
          ? "운영진 계정은 가입 후 SuperAdmin 승인·권한 부여가 필요합니다. 초대 코드가 있는 분만 가입할 수 있습니다."
          : "운영진 계정은 가입 후 SuperAdmin 승인·권한 부여가 필요합니다."
      }
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
      <AuthForm
        action={signupAction}
        submitLabel="가입하기"
        includeName
        requireInvite={requireInvite}
      />
    </AdminAuthShell>
  );
}
