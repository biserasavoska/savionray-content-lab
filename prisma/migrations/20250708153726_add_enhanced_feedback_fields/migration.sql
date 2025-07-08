-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "actionable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT DEFAULT 'general',
ADD COLUMN     "priority" TEXT DEFAULT 'medium',
ADD COLUMN     "rating" INTEGER DEFAULT 0;
