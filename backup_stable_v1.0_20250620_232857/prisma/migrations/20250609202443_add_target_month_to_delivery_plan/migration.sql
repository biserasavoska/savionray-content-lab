/*
  Warnings:

  - Added the required column `targetMonth` to the `ContentDeliveryPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "DeliveryPlanStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "ContentDeliveryPlan" ADD COLUMN     "targetMonth" TIMESTAMP(3) NOT NULL;
