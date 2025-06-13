/*
  Warnings:

  - Added the required column `contentType` to the `ContentDraft` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('NEWSLETTER', 'BLOG_POST', 'SOCIAL_MEDIA_POST', 'WEBSITE_COPY', 'EMAIL_CAMPAIGN');

-- CreateEnum
CREATE TYPE "DeliveryPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'DELIVERED');

-- AlterTable
ALTER TABLE "ContentDraft" ADD COLUMN     "contentType" "ContentType" NOT NULL;

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "contentType" "ContentType",
ADD COLUMN     "deliveryItemId" TEXT;

-- CreateTable
CREATE TABLE "ContentDeliveryPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "DeliveryPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "ContentDeliveryPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDeliveryItem" (
    "id" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DeliveryItemStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "ContentDeliveryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_deliveryItemId_fkey" FOREIGN KEY ("deliveryItemId") REFERENCES "ContentDeliveryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDeliveryPlan" ADD CONSTRAINT "ContentDeliveryPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDeliveryItem" ADD CONSTRAINT "ContentDeliveryItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ContentDeliveryPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
