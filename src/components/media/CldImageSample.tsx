"use client";

import { CldImage } from "next-cloudinary";

/**
 * Cloudinary delivery smoke sample (auto-format / auto-quality).
 * Uses sample public_id from the account Media Library, or upload your own.
 */
export function CldImageSample() {
  return (
    <CldImage
      src="cld-sample-5"
      width="500"
      height="500"
      alt="Cloudinary sample"
      crop={{
        type: "auto",
        source: true,
      }}
    />
  );
}
