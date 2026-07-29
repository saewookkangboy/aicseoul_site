import { type NextRequest, NextResponse } from "next/server";

/**
 * Legacy Supabase Auth cookie refresh — no-op.
 * Stack decision: Auth.js + Prisma; Supabase = hosted Postgres only.
 * Kept so older imports do not break; prefer not calling this from middleware.
 */
export async function updateSession(request: NextRequest) {
  void request;
  return NextResponse.next();
}
