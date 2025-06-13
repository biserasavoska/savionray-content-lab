BEGIN;

-- AlterEnum
ALTER TYPE "DeliveryPlanStatus" ADD VALUE 'ARCHIVED';

-- First add the column as nullable
ALTER TABLE "ContentDeliveryPlan" ADD COLUMN "targetMonth" TIMESTAMP(3);

-- Update existing records to use startDate as targetMonth
UPDATE "ContentDeliveryPlan" 
SET "targetMonth" = DATE_TRUNC('month', "startDate");

-- Now make the column required
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN "targetMonth" SET NOT NULL;

COMMIT; 