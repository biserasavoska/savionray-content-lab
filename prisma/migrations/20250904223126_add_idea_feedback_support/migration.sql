-- AlterTable
ALTER TABLE "public"."Feedback" ADD COLUMN     "actionable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "ideaId" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Feedback_ideaId_idx" ON "public"."Feedback"("ideaId");

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "public"."Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
