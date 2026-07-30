import type { Area } from "react-easy-crop";

/**
 * Draw the pixel crop area onto a canvas and export as JPEG Blob.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: Area,
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.round(crop.width));
  const height = Math.max(1, Math.round(crop.height));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 사용할 수 없습니다.");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("이미지 변환에 실패했습니다."));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("이미지를 불러오지 못했습니다.")));
    img.src = src;
  });
}
