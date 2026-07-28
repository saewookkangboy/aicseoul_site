import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateSession } from "@/utils/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  return to;
}

export default auth(async (req) => {
  const supabaseResponse = await updateSession(req);
  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/admin/pending");

  if (!pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  if (isAuthPage) {
    return supabaseResponse;
  }

  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return copyCookies(supabaseResponse, NextResponse.redirect(url));
  }

  if (req.auth.user.status === "pending") {
    return copyCookies(
      supabaseResponse,
      NextResponse.redirect(new URL("/admin/pending", req.nextUrl.origin)),
    );
  }

  if (req.auth.user.status !== "active") {
    return copyCookies(
      supabaseResponse,
      NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin)),
    );
  }

  return supabaseResponse;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * Needed so Supabase auth cookies stay refreshed.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
