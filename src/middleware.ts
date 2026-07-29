import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  defaultLocale,
  isLocale,
} from "@/lib/i18n/config";

/**
 * Admin gate via Auth.js + public locale redirect.
 * Supabase is hosted Postgres only (Prisma); Auth.js owns sessions.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/admin/pending");

  if (pathname.startsWith("/admin")) {
    if (isAuthPage) return NextResponse.next();

    if (!req.auth) {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    if (req.auth.user.status === "pending") {
      return NextResponse.redirect(
        new URL("/admin/pending", req.nextUrl.origin),
      );
    }

    if (req.auth.user.status !== "active") {
      return NextResponse.redirect(
        new URL("/admin/login", req.nextUrl.origin),
      );
    }

    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];
  if (isLocale(segment)) {
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, segment, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    res.headers.set(LOCALE_HEADER, segment);
    return res;
  }

  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)",
  ],
};
