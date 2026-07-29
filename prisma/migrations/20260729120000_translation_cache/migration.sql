-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL DEFAULT 'ko',
    "targetLang" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationCache_targetLang_idx" ON "TranslationCache"("targetLang");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_sourceHash_targetLang_key" ON "TranslationCache"("sourceHash", "targetLang");
