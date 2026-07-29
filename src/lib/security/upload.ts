const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function assertImageUpload(file: { type: string; size: number }) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("이미지만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("파일 크기는 8MB 이하여야 합니다.");
  }
}
