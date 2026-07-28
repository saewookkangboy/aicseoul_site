import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { MediaUploader, UploadedMedia } from "@/lib/media/index";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function saveLocalUpload(
  file: File,
  options?: { folder?: string; maxWidth?: number },
): Promise<UploadedMedia> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("이미지만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("파일 크기는 8MB 이하여야 합니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const year = new Date().getFullYear().toString();
  const folder = options?.folder ?? "general";
  const dir = path.join(process.cwd(), "public", "uploads", year, folder);
  await mkdir(dir, { recursive: true });

  const id = randomUUID().slice(0, 8);
  const base = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "");
  const filename = `${id}-${base || "image"}.webp`;
  const outPath = path.join(dir, filename);

  const maxWidth = options?.maxWidth ?? 1600;
  const image = sharp(buffer).rotate();
  const meta = await image.metadata();
  const resized = await image
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(outPath, resized);

  const url = `/uploads/${year}/${folder}/${filename}`;
  return {
    url,
    publicId: url,
    width: meta.width,
    height: meta.height,
  };
}

export const localDiskUploader: MediaUploader = {
  async upload(file, options) {
    return saveLocalUpload(file, options);
  },
};
