import { DraftStatus, Prisma } from '@prisma/client'

export interface DraftMetadata {
  contentType: 'social-media' | 'blog' | 'newsletter'
}

export type DraftWithMetadata = {
  metadata: DraftMetadata | null
}

export type DraftWithRelations = {
  id: string
  status: DraftStatus
  createdAt: Date
  updatedAt: Date
  createdById: string
  body: string
  metadata: Prisma.JsonValue
  ideaId: string
  createdBy: {
    name: string | null
    email: string | null
  }
} 