/*
  Warnings:

  - Added the required column `organizationId` to the `ContentDeliveryPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ContentDraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ContentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Idea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Create the new enums
-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Step 2: Create the Organization table first
-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "subscriptionPlan" "SubscriptionPlanType" NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "trialEndsAt" TIMESTAMP(3),
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxStorageGB" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create a default organization for existing data
INSERT INTO "Organization" ("id", "name", "slug", "domain", "primaryColor", "settings", "subscriptionPlan", "subscriptionStatus", "billingCycle", "maxUsers", "maxStorageGB", "createdAt", "updatedAt")
VALUES (
    'default-org-id',
    'SavionRay',
    'savionray',
    'savionray.com',
    '#3B82F6',
    '{"timezone": "UTC", "dateFormat": "MM/DD/YYYY", "currency": "USD"}',
    'FREE',
    'ACTIVE',
    'MONTHLY',
    5,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 4: Add organizationId columns with default values
-- AlterTable
ALTER TABLE "ContentDeliveryPlan" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'default-org-id';

-- AlterTable
ALTER TABLE "ContentDraft" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'default-org-id';

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'default-org-id';

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'default-org-id';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'default-org-id';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Step 5: Create the remaining tables
-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" "BillingCycle" NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxStorageGB" INTEGER NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create indexes
-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_organizationId_userId_key" ON "OrganizationUser"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- Step 7: Add foreign key constraints
-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDeliveryPlan" ADD CONSTRAINT "ContentDeliveryPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Migrate existing users to the default organization
INSERT INTO "OrganizationUser" ("id", "organizationId", "userId", "role", "permissions", "isActive", "joinedAt")
SELECT 
    'org-user-' || "User"."id",
    'default-org-id',
    "User"."id",
    (CASE 
        WHEN "User"."role" = 'ADMIN' THEN 'OWNER'
        WHEN "User"."role" = 'CLIENT' THEN 'ADMIN'
        ELSE 'MEMBER'
    END)::"OrganizationRole",
    '[]',
    true,
    CURRENT_TIMESTAMP
FROM "User";

-- Step 9: Remove default values from organizationId columns
ALTER TABLE "ContentDeliveryPlan" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "ContentDraft" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "ContentItem" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "Idea" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "Media" ALTER COLUMN "organizationId" DROP DEFAULT;
