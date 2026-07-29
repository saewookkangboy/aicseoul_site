import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Admin gate via Auth.js only.
 * Supabase is used as hosted Postgres (Prisma); Auth/Storage session refresh is not used.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/admin/pending");

  if (!pathname.startsWith("/admin") || isAuthPage) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (req.auth.user.status === "pending") {
    return NextResponse.redirect(new URL("/admin/pending", req.nextUrl.origin));
  }

  if (req.auth.user.status !== "active") {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
