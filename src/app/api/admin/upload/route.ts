import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMediaUploader } from "@/lib/media/uploader";
import { canAccessModule, type PermissionModule } from "@/lib/permissions";

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

  const form = await req.formData();
  const file = form.get("file");
  const module = String(form.get("module") ?? "") as PermissionModule;
  const folder = String(form.get("folder") || module || "general");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!MODULES.has(module) || !canAccessModule(session.user, module)) {
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
