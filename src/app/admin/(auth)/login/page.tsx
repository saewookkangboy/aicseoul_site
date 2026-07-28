import Link from "next/link";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { AuthForm } from "@/components/admin/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.status === "active") redirect("/admin");
  if (session?.user?.status === "pending") redirect("/admin/pending");

  return (
    <AdminAuthShell
      title="로그인"
      description="가입한 이메일과 비밀번호로 Admin에 들어갑니다."
      footer={
        <p>
          계정이 없나요?{" "}
          <Link
            href="/admin/signup"
            className="font-medium text-[var(--color-cta)] underline underline-offset-2"
          >
            회원가입
          </Link>
        </p>
      }
    >
      <AuthForm action={loginAction} submitLabel="로그인" />
    </AdminAuthShell>
  );
}
