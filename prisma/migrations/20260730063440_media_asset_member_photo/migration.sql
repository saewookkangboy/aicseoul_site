-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "byteSize" INTEGER,
ADD COLUMN     "folder" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "module" TEXT,
ADD COLUMN     "uploadedById" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "photoAssetId" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_module_createdAt_idx" ON "MediaAsset"("module", "createdAt");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
