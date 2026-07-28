import Link from "next/link";
import { AuthForm } from "@/components/admin/AuthForm";
import { signupAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user?.status === "active") redirect("/admin");
  if (session?.user?.status === "pending") redirect("/admin/pending");

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-8 px-5 py-16">
      <div>
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs tracking-[0.18em] text-[var(--color-gold)]">
          ADMIN
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">회원가입</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          운영진 계정은 가입 후 SuperAdmin 승인·권한 부여가 필요합니다.
        </p>
      </div>
      <AuthForm action={signupAction} submitLabel="가입하기" includeName />
      <p className="text-sm text-[var(--color-ink-muted)]">
        이미 계정이 있나요?{" "}
        <Link href="/admin/login" className="text-[var(--color-cta)] underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
