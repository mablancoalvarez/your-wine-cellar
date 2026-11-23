-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN "family_id" TEXT;
ALTER TABLE "refresh_tokens" ADD COLUMN "used_at" TIMESTAMP(3);

UPDATE "refresh_tokens"
SET "family_id" = md5(random()::text || "id")
WHERE "family_id" IS NULL;

ALTER TABLE "refresh_tokens" ALTER COLUMN "family_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");
