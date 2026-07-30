const ALLOWED = new Set(["image/jpeg", "image/png"]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ALLOWED;

export function assertImageUpload(file: { type: string; size: number }) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("JPG 또는 PNG 이미지만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("파일 크기는 5MB 이하여야 합니다.");
  }
}
