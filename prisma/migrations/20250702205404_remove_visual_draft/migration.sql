/*
  Warnings:

  - You are about to drop the column `visualDraftId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the `VisualDraft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_visualDraftId_fkey";

-- DropForeignKey
ALTER TABLE "VisualDraft" DROP CONSTRAINT "VisualDraft_createdById_fkey";

-- DropForeignKey
ALTER TABLE "VisualDraft" DROP CONSTRAINT "VisualDraft_ideaId_fkey";

-- DropIndex
DROP INDEX "Feedback_visualDraftId_idx";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "visualDraftId";

-- DropTable
DROP TABLE "VisualDraft";
