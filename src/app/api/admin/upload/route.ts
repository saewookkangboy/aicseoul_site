import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMediaUploader } from "@/lib/media/uploader";
import { canAccessModule, type PermissionModule } from "@/lib/permissions";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE } from "@/lib/security/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

const MODULES = new Set<PermissionModule>([
  "people",
  "meetups",
  "insights",
  "settings",
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIpFromHeaders(req.headers);
  const limited = checkRateLimit(
    `upload:${ip}:${session.user.id}`,
    RATE.upload.limit,
    RATE.upload.windowMs,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const permissionModule = String(form.get("module") ?? "") as PermissionModule;
  const folder = String(form.get("folder") || permissionModule || "general");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!MODULES.has(permissionModule) || !canAccessModule(session.user, permissionModule)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const uploader = getMediaUploader();
    const uploaded = await uploader.upload(file, { folder });
    return NextResponse.json(uploaded);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
