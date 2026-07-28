import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import {
  canAccessModule,
  isSuperAdmin,
  type PermissionModule,
  type SessionUser,
} from "@/lib/permissions";

type NavItem = {
  href: string;
  label: string;
  module?: PermissionModule;
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/people", label: "People", module: "people" },
  { href: "/admin/meetups", label: "Meetups", module: "meetups" },
  { href: "/admin/insights", label: "Insights", module: "insights" },
  { href: "/admin/contact", label: "문의함", module: "contact" },
  { href: "/admin/settings", label: "설정", module: "settings" },
  { href: "/admin/users", label: "사용자", superOnly: true },
];

export function AdminNav({ user }: { user: SessionUser }) {
  const items = NAV.filter((item) => {
    if (item.superOnly) return isSuperAdmin(user);
    if (!item.module) return true;
    return canAccessModule(user, item.module);
  });

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium"
          >
            AIC Seoul Admin
          </Link>
          <nav className="flex flex-wrap gap-3 md:gap-4">
            {items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-[var(--color-ink-muted)] underline">
            사이트
          </Link>
          <span className="hidden text-xs text-[var(--color-ink-muted)] md:inline">
            {user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-[var(--color-ink-muted)] underline"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
