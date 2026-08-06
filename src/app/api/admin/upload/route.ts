import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMediaUploader,
  MediaStoreUnconfiguredError,
} from "@/lib/media/uploader";
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
  const limited = await checkRateLimit(
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
  const permissionModule = String(form.get("module") ?? "");
  const folder = String(form.get("folder") || permissionModule || "general");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const isAccountSelfUpload = permissionModule === "account";
  if (isAccountSelfUpload) {
    // active session already verified above
  } else if (
    !MODULES.has(permissionModule as PermissionModule) ||
    !canAccessModule(session.user, permissionModule as PermissionModule)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const uploader = getMediaUploader();
    const uploaded = await uploader.upload(file, { folder });
    const asset = await prisma.mediaAsset.create({
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId ?? null,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        module: isAccountSelfUpload ? "account" : permissionModule,
        folder,
        mimeType: file.type || null,
        byteSize: file.size,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json({
      url: uploaded.url,
      assetId: asset.id,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      mimeType: file.type,
      byteSize: file.size,
    });
  } catch (e) {
    if (e instanceof MediaStoreUnconfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
