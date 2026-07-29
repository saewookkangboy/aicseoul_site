import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { MediaUploader, UploadedMedia } from "@/lib/media/index";
import { assertImageUpload } from "@/lib/security/upload";

export async function saveLocalUpload(
  file: File,
  options?: { folder?: string; maxWidth?: number },
): Promise<UploadedMedia> {
  assertImageUpload(file);

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
