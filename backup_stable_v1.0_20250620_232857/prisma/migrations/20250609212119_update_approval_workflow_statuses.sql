-- First update the enum types with new values
ALTER TYPE "IdeaStatus" ADD VALUE 'PENDING_CLIENT_APPROVAL';
ALTER TYPE "DraftStatus" ADD VALUE 'PENDING_FIRST_REVIEW';
ALTER TYPE "DraftStatus" ADD VALUE 'NEEDS_REVISION';
ALTER TYPE "DraftStatus" ADD VALUE 'PENDING_FINAL_APPROVAL';
ALTER TYPE "DraftStatus" ADD VALUE 'APPROVED_FOR_PUBLISHING';
ALTER TYPE "DraftStatus" ADD VALUE 'REJECTED';

-- Update existing records to use new status values
UPDATE "Idea"
SET status = 'PENDING_CLIENT_APPROVAL'
WHERE status = 'PENDING';

UPDATE "ContentDraft"
SET status = 'PENDING_FIRST_REVIEW'
WHERE status = 'PENDING_FEEDBACK';

UPDATE "ContentDraft"
SET status = 'PENDING_FINAL_APPROVAL'
WHERE status = 'AWAITING_FINAL_APPROVAL';

UPDATE "ContentDraft"
SET status = 'APPROVED_FOR_PUBLISHING'
WHERE status = 'APPROVED';

-- Now remove old enum values
ALTER TYPE "IdeaStatus" RENAME TO "IdeaStatus_old";
CREATE TYPE "IdeaStatus" AS ENUM ('PENDING_CLIENT_APPROVAL', 'APPROVED_BY_CLIENT', 'REJECTED_BY_CLIENT');
ALTER TABLE "Idea" ALTER COLUMN status TYPE "IdeaStatus" USING status::text::"IdeaStatus";
DROP TYPE "IdeaStatus_old";

ALTER TYPE "DraftStatus" RENAME TO "DraftStatus_old";
CREATE TYPE "DraftStatus" AS ENUM ('PENDING_FIRST_REVIEW', 'NEEDS_REVISION', 'PENDING_FINAL_APPROVAL', 'APPROVED_FOR_PUBLISHING', 'REJECTED');
ALTER TABLE "ContentDraft" ALTER COLUMN status TYPE "DraftStatus" USING status::text::"DraftStatus";
DROP TYPE "DraftStatus_old";

-- Remove ARCHIVED from DeliveryPlanStatus
ALTER TYPE "DeliveryPlanStatus" RENAME TO "DeliveryPlanStatus_old";
CREATE TYPE "DeliveryPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN status TYPE "DeliveryPlanStatus" USING status::text::"DeliveryPlanStatus";
DROP TYPE "DeliveryPlanStatus_old"; 