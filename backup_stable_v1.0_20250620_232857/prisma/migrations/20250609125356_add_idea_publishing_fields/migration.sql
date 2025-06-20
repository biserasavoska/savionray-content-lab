-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'GRAPH_OR_INFOGRAPHIC', 'VIDEO', 'SOCIAL_CARD', 'POLL', 'CAROUSEL');

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "mediaType" "MediaType",
ADD COLUMN     "publishingDateTime" TIMESTAMP(3),
ADD COLUMN     "savedForLater" BOOLEAN NOT NULL DEFAULT false;
