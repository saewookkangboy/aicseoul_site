import { v2 as cloudinary } from "cloudinary";
import type { MediaUploader, UploadedMedia } from "@/lib/media/index";
import { assertImageUpload } from "@/lib/security/upload";

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function isCloudinaryEnabled() {
  return configured();
}

export const cloudinaryUploader: MediaUploader = {
  async upload(file, options) {
    if (!configured()) {
      throw new Error("Cloudinary is not configured");
    }

    assertImageUpload(file);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder =
      process.env.CLOUDINARY_FOLDER ||
      `aic-seoul/${options?.folder ?? "general"}`;

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width?: number;
      height?: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            format: "webp",
            transformation: [{ width: 1600, crop: "limit" }],
          },
          (err, res) => {
            if (err || !res) reject(err ?? new Error("Cloudinary upload failed"));
            else
              resolve({
                secure_url: res.secure_url!,
                public_id: res.public_id!,
                width: res.width,
                height: res.height,
              });
          },
        )
        .end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    } satisfies UploadedMedia;
  },
};
