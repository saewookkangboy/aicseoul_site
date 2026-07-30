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
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
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
  { href: "/admin/people", label: "멤버", icon: UsersThree, module: "people" },
  {
    href: "/admin/meetups",
    label: "밋업",
    icon: CalendarBlank,
    module: "meetups",
  },
  {
    href: "/admin/insights",
    label: "인사이트",
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

const focusRing =
  "outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_40%,transparent)]";

const whiteStyle: CSSProperties = { color: "#ffffff" };

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getFocusable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.tabIndex !== -1);
}

export function AdminNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  const titleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (navPath !== pathname) {
    setNavPath(pathname);
    if (open) setOpen(false);
  }

  const items = NAV.filter((item) => {
    if (item.superOnly) return isSuperAdmin(user);
    if (!item.module) return true;
    return canAccessModule(user, item.module);
  });

  const mobileDrawerInactive = isMobile && !open;

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        menuButtonRef.current?.focus();
      }
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;

    const aside = asideRef.current;
    const focusables = aside ? getFocusable(aside) : [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !aside) return;
      const list = getFocusable(aside);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
        <Link href="/admin" className={`group min-w-0 ${focusRing}`} style={whiteStyle}>
          <p className="admin-sidebar-gold font-display text-[11px] tracking-[0.16em]">
            AIC SEOUL
          </p>
          <p
            className="mt-1 truncate text-sm font-medium"
            style={whiteStyle}
          >
            Admin Console
          </p>
        </Link>
        <button
          type="button"
          className={`rounded-lg p-2 hover:bg-white/10 lg:hidden ${focusRing}`}
          style={whiteStyle}
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
        >
          <X className="size-5" weight="regular" aria-hidden />
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
              style={whiteStyle}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-[background-color,transform] duration-200 active:scale-[0.96] motion-reduce:transform-none ${focusRing} ${
                active ? "bg-white/12" : "hover:bg-white/6"
              }`}
            >
              <Icon
                className="size-[1.15rem] shrink-0"
                weight={active ? "fill" : "regular"}
                aria-hidden
                style={whiteStyle}
              />
              <span style={whiteStyle}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-4">
        <div className="flex items-start gap-2.5 px-1">
          <House
            className="admin-sidebar-gold mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-xs" style={whiteStyle}>
              {user.name ?? user.email}
            </p>
            <p className="admin-sidebar-muted mt-0.5 truncate text-[11px]">
              {user.role === "superadmin" ? "슈퍼관리자" : "운영자"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <Link
            href="/"
            style={whiteStyle}
            className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/6 ${focusRing}`}
          >
            <ArrowSquareOut className="size-3.5" aria-hidden style={whiteStyle} />
            <span style={whiteStyle}>공개 사이트</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              style={whiteStyle}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/6 ${focusRing}`}
            >
              <SignOut className="size-3.5" aria-hidden style={whiteStyle} />
              <span style={whiteStyle}>로그아웃</span>
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
          ref={menuButtonRef}
          type="button"
          className={`inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] transition-[transform,border-color] active:scale-[0.96] motion-reduce:transform-none ${focusRing}`}
          aria-expanded={open}
          aria-controls={titleId}
          onClick={() => setOpen(true)}
        >
          <List className="size-4" aria-hidden />
          메뉴
        </button>
        <Link
          href="/admin"
          className={`font-display text-sm font-medium text-[var(--color-ink)] ${focusRing}`}
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
        ref={asideRef}
        id={titleId}
        aria-hidden={mobileDrawerInactive ? true : undefined}
        {...(mobileDrawerInactive ? { inert: true } : {})}
        style={whiteStyle}
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col bg-[var(--color-dark)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none lg:static lg:z-auto lg:translate-x-0 lg:shrink-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full max-lg:pointer-events-none max-lg:invisible lg:translate-x-0"
        }`}
      >
        {navBody}
      </aside>
    </>
  );
}
