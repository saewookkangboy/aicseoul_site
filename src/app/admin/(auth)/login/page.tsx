import Link from "next/link";
import { AuthForm } from "@/components/admin/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.status === "active") redirect("/admin");
  if (session?.user?.status === "pending") redirect("/admin/pending");

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-8 px-5 py-16">
      <div>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          ADMIN
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">로그인</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          가입한 이메일과 비밀번호로 로그인합니다.
        </p>
      </div>
      <AuthForm action={loginAction} submitLabel="로그인" />
      <p className="text-sm text-[var(--color-ink-muted)]">
        계정이 없나요?{" "}
        <Link href="/admin/signup" className="text-[var(--color-cta)] underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
