import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  assertImageUpload,
} from "@/lib/security/upload";

export type UploadResult = {
  url: string;
  assetId: string;
  publicId?: string;
  width?: number;
  height?: number;
  mimeType: string;
  byteSize: number;
};

export type UploadAdminImageOptions = {
  file: File | Blob;
  module: "people" | "meetups" | "insights" | "settings" | "account";
  folder?: string;
  filename?: string;
  onProgress?: (percent: number) => void;
};

export function validateImageFile(file: { type: string; size: number }) {
  assertImageUpload(file);
}

export { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES };

/**
 * Upload via XHR so upload progress events are available.
 */
export function uploadAdminImage(
  options: UploadAdminImageOptions,
): Promise<UploadResult> {
  const { file, module, folder, filename, onProgress } = options;

  if (file instanceof File) {
    validateImageFile(file);
  } else if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("파일 크기는 5MB 이하여야 합니다.");
  }

  const body = new FormData();
  const name =
    filename ??
    (file instanceof File && file.name ? file.name : "crop.jpg");
  body.set("file", file, name);
  body.set("module", module);
  if (folder) body.set("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      const data = xhr.response as
        | (Partial<UploadResult> & { error?: string })
        | null;
      if (xhr.status >= 200 && xhr.status < 300 && data?.url && data.assetId) {
        resolve({
          url: data.url,
          assetId: data.assetId,
          publicId: data.publicId,
          width: data.width,
          height: data.height,
          mimeType: data.mimeType ?? "image/jpeg",
          byteSize: data.byteSize ?? file.size,
        });
        return;
      }
      reject(new Error(data?.error || "업로드 실패"));
    };

    xhr.onerror = () => reject(new Error("업로드 실패"));
    xhr.send(body);
  });
}
