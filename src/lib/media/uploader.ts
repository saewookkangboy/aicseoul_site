import type { MediaUploader } from "@/lib/media/index";
import { cloudinaryUploader, isCloudinaryEnabled } from "@/lib/media/cloudinary";
import { localDiskUploader } from "@/lib/media/local";
import { isProd } from "@/lib/env";

export type { UploadedMedia, MediaUploader } from "@/lib/media/index";
export { isCloudinaryEnabled } from "@/lib/media/cloudinary";

/** Thrown when no durable media store is configured in production. */
export class MediaStoreUnconfiguredError extends Error {
  constructor() {
    super(
      "미디어 저장소가 구성되지 않았습니다. 프로덕션에서는 Cloudinary가 필요합니다.",
    );
    this.name = "MediaStoreUnconfiguredError";
  }
}

export function getMediaUploader(): MediaUploader {
  if (isCloudinaryEnabled()) {
    return cloudinaryUploader;
  }
  // Fail-closed: the local disk uploader writes to an ephemeral filesystem on
  // Vercel, so uploads would silently vanish on the next deploy/cold start.
  // Refuse instead of losing data. Local dev falls through to disk.
  if (isProd) {
    throw new MediaStoreUnconfiguredError();
  }
  return localDiskUploader;
}
