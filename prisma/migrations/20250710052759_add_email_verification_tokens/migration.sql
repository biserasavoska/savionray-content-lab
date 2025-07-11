/*
  Warnings:

  - You are about to drop the column `actionable` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "OrganizationInvitation_invitedBy_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "OrganizationInvitation_organizationId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "actionable",
DROP COLUMN "category",
DROP COLUMN "priority",
DROP COLUMN "rating";

-- DropTable
DROP TABLE "OrganizationInvitation";

-- DropEnum
DROP TYPE "InvitationStatus";

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "ContentDeliveryPlan_organizationId_idx" ON "ContentDeliveryPlan"("organizationId");

-- CreateIndex
CREATE INDEX "ContentDraft_organizationId_idx" ON "ContentDraft"("organizationId");

-- CreateIndex
CREATE INDEX "ContentItem_organizationId_idx" ON "ContentItem"("organizationId");

-- CreateIndex
CREATE INDEX "Idea_organizationId_idx" ON "Idea"("organizationId");

-- CreateIndex
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationUser_userId_idx" ON "OrganizationUser"("userId");

-- CreateIndex
CREATE INDEX "OrganizationUser_organizationId_idx" ON "OrganizationUser"("organizationId");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
