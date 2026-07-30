import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  defaultLocale,
  isLocale,
} from "@/lib/i18n/config";
import {
  authJwtGetTokenOptions,
  requestIsHttps,
} from "@/lib/security/auth-jwt-edge";

/**
 * Locale redirect for public routes + JWT gate for /admin.
 * Intentionally avoids importing `@/lib/auth` (and Prisma) so Edge middleware
 * does not open DB connections on every public request.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/admin/pending");

  if (pathname.startsWith("/admin")) {
    if (isAuthPage) return NextResponse.next();

    const token = await getToken({
      req,
      ...authJwtGetTokenOptions({
        secret: process.env.AUTH_SECRET,
        isHttps: requestIsHttps(req),
      }),
    });

    if (!token?.email) {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const status = String(token.status ?? "");
    if (status === "pending") {
      return NextResponse.redirect(
        new URL("/admin/pending", req.nextUrl.origin),
      );
    }
    if (status !== "active") {
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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)"],
};
