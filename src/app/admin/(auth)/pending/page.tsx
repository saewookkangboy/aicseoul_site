import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.status === "active") redirect("/admin");

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center gap-6 px-5 py-16">
      <h1 className="text-3xl font-medium tracking-tight">승인 대기</h1>
      <p className="text-[var(--color-ink-muted)]">
        <strong className="text-[var(--color-ink)]">{session.user.email}</strong>{" "}
        계정은 SuperAdmin 승인 후 Admin에 접근할 수 있습니다.
      </p>
      <form action={logoutAction}>
        <button type="submit" className="text-sm text-[var(--color-cta)] underline">
          로그아웃
        </button>
      </form>
      <Link href="/" className="text-sm text-[var(--color-ink-muted)] underline">
        사이트로 돌아가기
      </Link>
    </div>
  );
}
