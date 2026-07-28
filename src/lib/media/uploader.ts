import type { MediaUploader } from "@/lib/media/index";
import { cloudinaryUploader, isCloudinaryEnabled } from "@/lib/media/cloudinary";
import { localDiskUploader } from "@/lib/media/local";

export type { UploadedMedia, MediaUploader } from "@/lib/media/index";
export { isCloudinaryEnabled } from "@/lib/media/cloudinary";

export function getMediaUploader(): MediaUploader {
  if (isCloudinaryEnabled()) {
    return cloudinaryUploader;
  }
  return localDiskUploader;
}
