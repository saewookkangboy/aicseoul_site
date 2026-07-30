import Link from "next/link";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { btnGhostClass, btnSecondaryClass } from "@/components/admin/ui";
import { logoutAction } from "@/lib/actions/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.status === "active") redirect("/admin");

  return (
    <AdminAuthShell
      title="승인 대기"
      description={`${session.user.email} 계정은 승인될 때까지 Admin에 들어갈 수 없습니다.`}
      footer={
        <div className="flex flex-wrap items-center gap-4">
          <form action={logoutAction}>
            <button type="submit" className={btnSecondaryClass}>
              로그아웃
            </button>
          </form>
          <Link href="/" className={btnGhostClass}>
            공개 사이트로 이동
          </Link>
        </div>
      }
    >
      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-cream)]/50 px-5 py-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        자동 메일 안내는 없을 수 있습니다. SuperAdmin에게 승인을 요청한 뒤,
        승인되면 다시 로그인해 주세요.
      </div>
    </AdminAuthShell>
  );
}
