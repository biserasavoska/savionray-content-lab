-- AlterTable
ALTER TABLE "public"."KnowledgeDocument" ADD COLUMN     "openaiFileId" TEXT;

-- CreateIndex
CREATE INDEX "KnowledgeDocument_openaiFileId_idx" ON "public"."KnowledgeDocument"("openaiFileId");
