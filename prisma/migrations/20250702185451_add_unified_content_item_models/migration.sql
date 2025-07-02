-- CreateEnum
CREATE TYPE "ContentItemStatus" AS ENUM ('IDEA', 'CONTENT_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "WorkflowStage" AS ENUM ('IDEA', 'CONTENT_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT,
    "status" "ContentItemStatus" NOT NULL DEFAULT 'IDEA',
    "contentType" "ContentType" NOT NULL,
    "mediaType" "MediaType",
    "metadata" JSONB DEFAULT '{}',
    "currentStage" "WorkflowStage" NOT NULL DEFAULT 'IDEA',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "deliveryItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTransition" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "fromStage" "WorkflowStage" NOT NULL,
    "toStage" "WorkflowStage" NOT NULL,
    "transitionedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transitionedBy" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "StageTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItemFeedback" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentItemId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ContentItemFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItemMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentItemId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "ContentItemMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItemScheduledPost" (
    "id" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentItemId" TEXT NOT NULL,

    CONSTRAINT "ContentItemScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItemComment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentItemId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ContentItemComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentItem_currentStage_idx" ON "ContentItem"("currentStage");

-- CreateIndex
CREATE INDEX "ContentItem_status_idx" ON "ContentItem"("status");

-- CreateIndex
CREATE INDEX "ContentItem_createdById_idx" ON "ContentItem"("createdById");

-- CreateIndex
CREATE INDEX "ContentItem_assignedToId_idx" ON "ContentItem"("assignedToId");

-- CreateIndex
CREATE INDEX "StageTransition_contentItemId_idx" ON "StageTransition"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentItemFeedback_contentItemId_idx" ON "ContentItemFeedback"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentItemFeedback_createdById_idx" ON "ContentItemFeedback"("createdById");

-- CreateIndex
CREATE INDEX "ContentItemMedia_contentItemId_idx" ON "ContentItemMedia"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentItemScheduledPost_contentItemId_idx" ON "ContentItemScheduledPost"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentItemComment_contentItemId_idx" ON "ContentItemComment"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentItemComment_createdById_idx" ON "ContentItemComment"("createdById");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_deliveryItemId_fkey" FOREIGN KEY ("deliveryItemId") REFERENCES "ContentDeliveryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_transitionedBy_fkey" FOREIGN KEY ("transitionedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemFeedback" ADD CONSTRAINT "ContentItemFeedback_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemFeedback" ADD CONSTRAINT "ContentItemFeedback_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemMedia" ADD CONSTRAINT "ContentItemMedia_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemMedia" ADD CONSTRAINT "ContentItemMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemScheduledPost" ADD CONSTRAINT "ContentItemScheduledPost_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemComment" ADD CONSTRAINT "ContentItemComment_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemComment" ADD CONSTRAINT "ContentItemComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
