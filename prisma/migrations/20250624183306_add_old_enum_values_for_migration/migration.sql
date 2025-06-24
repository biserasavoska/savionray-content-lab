-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DraftStatus" ADD VALUE 'DRAFT';
ALTER TYPE "DraftStatus" ADD VALUE 'AWAITING_FEEDBACK';
ALTER TYPE "DraftStatus" ADD VALUE 'AWAITING_REVISION';
ALTER TYPE "DraftStatus" ADD VALUE 'APPROVED';
ALTER TYPE "DraftStatus" ADD VALUE 'PUBLISHED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IdeaStatus" ADD VALUE 'PENDING';
ALTER TYPE "IdeaStatus" ADD VALUE 'APPROVED';
ALTER TYPE "IdeaStatus" ADD VALUE 'REJECTED';

-- AlterTable
-- ALTER TABLE "ContentDraft" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
-- ALTER TABLE "Idea" ALTER COLUMN "status" SET DEFAULT 'PENDING';
