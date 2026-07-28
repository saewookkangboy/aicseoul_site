export type UploadedMedia = {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
};

export type MediaUploader = {
  upload(file: File, options?: { folder?: string }): Promise<UploadedMedia>;
  delete?(publicId: string): Promise<void>;
};

/**
 * P1 stub: stores nothing remotely. Swap for Cloudinary in P3/P4.
 * Callers should treat returned URL as temporary/local.
 */
export const localMediaStub: MediaUploader = {
  async upload(file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    return {
      url: `/uploads/stub/${Date.now()}-${safeName}`,
      publicId: `stub/${safeName}`,
    };
  },
};

export function getMediaUploader(): MediaUploader {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    // Cloudinary adapter lands in P3/P4 when credentials exist.
    return localMediaStub;
  }
  return localMediaStub;
}
