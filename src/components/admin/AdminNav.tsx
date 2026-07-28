"use client";

import {
  ArticleNyTimes,
  CalendarBlank,
  EnvelopeSimple,
  GearSix,
  House,
  SignOut,
  SquaresFour,
  Users,
  UsersThree,
  X,
  List,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ComponentType } from "react";
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
  icon: ComponentType<{ className?: string; weight?: "regular" | "fill" }>;
  module?: PermissionModule;
  superOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "대시보드", icon: SquaresFour },
  { href: "/admin/people", label: "People", icon: UsersThree, module: "people" },
  {
    href: "/admin/meetups",
    label: "Meetups",
    icon: CalendarBlank,
    module: "meetups",
  },
  {
    href: "/admin/insights",
    label: "Insights",
    icon: ArticleNyTimes,
    module: "insights",
  },
  {
    href: "/admin/contact",
    label: "문의함",
    icon: EnvelopeSimple,
    module: "contact",
  },
  { href: "/admin/settings", label: "설정", icon: GearSix, module: "settings" },
  { href: "/admin/users", label: "사용자", icon: Users, superOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  const titleId = useId();

  if (navPath !== pathname) {
    setNavPath(pathname);
    if (open) setOpen(false);
  }

  const items = NAV.filter((item) => {
    if (item.superOnly) return isSuperAdmin(user);
    if (!item.module) return true;
    return canAccessModule(user, item.module);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const navBody = (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
        <Link href="/admin" className="group min-w-0">
          <p className="font-display text-[11px] tracking-[0.16em] text-[var(--color-gold)]">
            AIC SEOUL
          </p>
          <p className="mt-1 truncate text-sm font-medium text-[var(--color-surface)] transition-colors group-hover:text-white">
            Admin Console
          </p>
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--color-surface)]/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
        >
          <X className="size-5" weight="regular" />
        </button>
      </div>

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4"
        aria-label="Admin 메뉴"
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-[background-color,color,transform] duration-200 active:scale-[0.99] ${
                active
                  ? "bg-white/12 text-white"
                  : "text-[var(--color-surface)]/65 hover:bg-white/6 hover:text-[var(--color-surface)]"
              }`}
            >
              <Icon
                className="size-[1.15rem] shrink-0"
                weight={active ? "fill" : "regular"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-4">
        <div className="flex items-start gap-2.5 px-1">
          <House className="mt-0.5 size-4 shrink-0 text-[var(--color-gold)]" />
          <div className="min-w-0">
            <p className="truncate text-xs text-[var(--color-surface)]/90">
              {user.name ?? user.email}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-surface)]/45">
              {user.role}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--color-surface)]/55 transition-colors hover:bg-white/6 hover:text-[var(--color-surface)]"
          >
            <ArrowSquareOut className="size-3.5" />
            공개 사이트
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--color-surface)]/55 transition-colors hover:bg-white/6 hover:text-[var(--color-surface)]"
            >
              <SignOut className="size-3.5" />
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] transition-[transform,border-color] active:scale-[0.98]"
          aria-expanded={open}
          aria-controls={titleId}
          onClick={() => setOpen(true)}
        >
          <List className="size-4" />
          메뉴
        </button>
        <Link
          href="/admin"
          className="font-display text-sm font-medium"
        >
          AIC Admin
        </Link>
        <span className="w-[4.5rem]" aria-hidden />
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[var(--color-dark)]/45 backdrop-blur-[2px] lg:hidden"
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id={titleId}
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col bg-[var(--color-dark)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:z-auto lg:translate-x-0 lg:shrink-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {navBody}
      </aside>
    </>
  );
}
