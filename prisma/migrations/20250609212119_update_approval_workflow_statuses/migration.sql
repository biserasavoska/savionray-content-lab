/*
  Warnings:

  - The values [ARCHIVED] on the enum `DeliveryPlanStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_FEEDBACK,AWAITING_FINAL_APPROVAL,APPROVED] on the enum `DraftStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `IdeaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryPlanStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN "status" TYPE "DeliveryPlanStatus_new" USING ("status"::text::"DeliveryPlanStatus_new");
ALTER TYPE "DeliveryPlanStatus" RENAME TO "DeliveryPlanStatus_old";
ALTER TYPE "DeliveryPlanStatus_new" RENAME TO "DeliveryPlanStatus";
DROP TYPE "DeliveryPlanStatus_old";
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DraftStatus_new" AS ENUM ('PENDING_FIRST_REVIEW', 'NEEDS_REVISION', 'PENDING_FINAL_APPROVAL', 'APPROVED_FOR_PUBLISHING', 'REJECTED');
ALTER TABLE "ContentDraft" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContentDraft" ALTER COLUMN "status" TYPE "DraftStatus_new" USING ("status"::text::"DraftStatus_new");
ALTER TYPE "DraftStatus" RENAME TO "DraftStatus_old";
ALTER TYPE "DraftStatus_new" RENAME TO "DraftStatus";
DROP TYPE "DraftStatus_old";
ALTER TABLE "ContentDraft" ALTER COLUMN "status" SET DEFAULT 'PENDING_FIRST_REVIEW';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IdeaStatus_new" AS ENUM ('PENDING_CLIENT_APPROVAL', 'APPROVED_BY_CLIENT', 'REJECTED_BY_CLIENT');
ALTER TABLE "Idea" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "status" TYPE "IdeaStatus_new" USING ("status"::text::"IdeaStatus_new");
ALTER TYPE "IdeaStatus" RENAME TO "IdeaStatus_old";
ALTER TYPE "IdeaStatus_new" RENAME TO "IdeaStatus";
DROP TYPE "IdeaStatus_old";
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING_CLIENT_APPROVAL';
COMMIT;

-- AlterTable
ALTER TABLE "ContentDeliveryPlan" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ContentDraft" ALTER COLUMN "status" SET DEFAULT 'PENDING_FIRST_REVIEW';

-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING_CLIENT_APPROVAL';
