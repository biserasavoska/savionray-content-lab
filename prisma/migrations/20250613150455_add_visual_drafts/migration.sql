-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_contentDraftId_fkey";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "visualDraftId" TEXT,
ALTER COLUMN "contentDraftId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VisualDraft" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "imageUrl" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "VisualDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisualDraft_ideaId_idx" ON "VisualDraft"("ideaId");

-- CreateIndex
CREATE INDEX "VisualDraft_createdById_idx" ON "VisualDraft"("createdById");

-- CreateIndex
CREATE INDEX "Feedback_contentDraftId_idx" ON "Feedback"("contentDraftId");

-- CreateIndex
CREATE INDEX "Feedback_visualDraftId_idx" ON "Feedback"("visualDraftId");

-- CreateIndex
CREATE INDEX "Feedback_createdById_idx" ON "Feedback"("createdById");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_contentDraftId_fkey" FOREIGN KEY ("contentDraftId") REFERENCES "ContentDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_visualDraftId_fkey" FOREIGN KEY ("visualDraftId") REFERENCES "VisualDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualDraft" ADD CONSTRAINT "VisualDraft_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualDraft" ADD CONSTRAINT "VisualDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
