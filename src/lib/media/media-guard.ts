import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAllowedMediaUrl } from "@/lib/media/media-url";

export const optionalMediaUrlSchema = z
  .string()
  .trim()
  .refine((v) => isAllowedMediaUrl(v), {
    message: "허용되지 않은 이미지 URL입니다.",
  })
  .optional();

export type ResolvePhotoAssetInput = {
  photoUrl?: string;
  photoAssetId?: string;
  /** When set, new MediaAsset links must be owned by this user. */
  requireUploadedById?: string;
  /** Already-linked asset may be kept even if uploaded by someone else. */
  existingPhotoAssetId?: string | null;
};

/**
 * Normalize photoUrl + photoAssetId before Member write.
 * Legacy rows may have photoUrl without assetId.
 */
export async function resolveMemberPhotoFields(
  input: ResolvePhotoAssetInput,
): Promise<{ photoUrl: string | null; photoAssetId: string | null }> {
  const photoUrl = input.photoUrl?.trim() || null;
  const photoAssetId = input.photoAssetId?.trim() || null;

  if (!photoAssetId) {
    if (photoUrl && !isAllowedMediaUrl(photoUrl)) {
      throw new Error("허용되지 않은 이미지 URL입니다.");
    }
    return { photoUrl, photoAssetId: null };
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: photoAssetId },
    select: { id: true, url: true, uploadedById: true },
  });
  if (!asset) {
    throw new Error("사진 에셋을 찾을 수 없습니다.");
  }

  const isExistingLink = input.existingPhotoAssetId === asset.id;
  if (
    !isExistingLink &&
    input.requireUploadedById &&
    asset.uploadedById &&
    asset.uploadedById !== input.requireUploadedById
  ) {
    throw new Error("본인이 업로드한 사진만 연결할 수 있습니다.");
  }

  if (photoUrl && photoUrl !== asset.url) {
    throw new Error("사진 URL과 에셋이 일치하지 않습니다.");
  }

  if (!isAllowedMediaUrl(asset.url)) {
    throw new Error("허용되지 않은 이미지 URL입니다.");
  }

  return { photoUrl: photoUrl ?? asset.url, photoAssetId: asset.id };
}

export function assertAllowedMediaUrls(urls: Array<string | undefined | null>) {
  for (const url of urls) {
    if (!url) continue;
    if (!isAllowedMediaUrl(url)) {
      throw new Error("허용되지 않은 이미지 URL입니다.");
    }
  }
}
