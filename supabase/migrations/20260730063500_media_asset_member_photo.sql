-- Mirror of prisma/migrations/20260730063440_media_asset_member_photo
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "byteSize" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "folder" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "module" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "photoAssetId" TEXT;

CREATE INDEX IF NOT EXISTS "MediaAsset_module_createdAt_idx" ON "MediaAsset"("module", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Member_photoAssetId_fkey'
  ) THEN
    ALTER TABLE "Member"
      ADD CONSTRAINT "Member_photoAssetId_fkey"
      FOREIGN KEY ("photoAssetId") REFERENCES "MediaAsset"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MediaAsset_uploadedById_fkey'
  ) THEN
    ALTER TABLE "MediaAsset"
      ADD CONSTRAINT "MediaAsset_uploadedById_fkey"
      FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
