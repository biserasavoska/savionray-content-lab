/*
  Warnings:

  - The values [PENDING_FIRST_REVIEW,NEEDS_REVISION,PENDING_FINAL_APPROVAL,APPROVED_FOR_PUBLISHING] on the enum `DraftStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_CLIENT_APPROVAL,APPROVED_BY_CLIENT,REJECTED_BY_CLIENT] on the enum `IdeaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DraftStatus_new" AS ENUM ('DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED', 'PUBLISHED');
ALTER TABLE "ContentDraft" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContentDraft" ALTER COLUMN "status" TYPE "DraftStatus_new" USING ("status"::text::"DraftStatus_new");
ALTER TYPE "DraftStatus" RENAME TO "DraftStatus_old";
ALTER TYPE "DraftStatus_new" RENAME TO "DraftStatus";
DROP TYPE "DraftStatus_old";
ALTER TABLE "ContentDraft" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IdeaStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "Idea" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE "IdeaStatus_new" USING ("status"::text::"IdeaStatus_new");
ALTER TYPE "IdeaStatus" RENAME TO "IdeaStatus_old";
ALTER TYPE "IdeaStatus_new" RENAME TO "IdeaStatus";
DROP TYPE "IdeaStatus_old";
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "ContentDraft" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING';
