export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Largest 3:4 crop rectangle that fits inside the image, centered on the face
 * center (or image center when face is missing). Crop is clamped to bounds.
 */
export function computeFaceCenteredCrop(
  image: { width: number; height: number },
  face?: Rect | null,
): Rect {
  const { width: iw, height: ih } = image;
  if (iw <= 0 || ih <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const targetRatio = 3 / 4; // width / height
  let cropW: number;
  let cropH: number;

  if (iw / ih > targetRatio) {
    cropH = ih;
    cropW = cropH * targetRatio;
  } else {
    cropW = iw;
    cropH = cropW / targetRatio;
  }

  const cx = face ? face.x + face.width / 2 : iw / 2;
  const cy = face ? face.y + face.height / 2 : ih / 2;

  let x = cx - cropW / 2;
  let y = cy - cropH / 2;

  x = Math.min(Math.max(0, x), iw - cropW);
  y = Math.min(Math.max(0, y), ih - cropH);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropW),
    height: Math.round(cropH),
  };
}
