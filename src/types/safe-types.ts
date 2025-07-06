import { DraftStatus, ContentType, IdeaStatus, MediaType, UserRole } from '@prisma/client'

// Safe types that guarantee non-null fields for frontend usage
export interface SafeUser {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

export interface SafeIdea {
  id: string
  title: string
  description: string
  status: IdeaStatus
  publishingDateTime: Date | null
  savedForLater: boolean
  mediaType: MediaType | null
  createdAt: Date
  updatedAt: Date
  createdBy: SafeUser
  createdById: string
  contentType: ContentType | null
  deliveryItemId?: string | null
}

export interface SafeContentDraft {
  id: string
  status: DraftStatus
  contentType: ContentType
  createdAt: Date
  updatedAt: Date
  createdBy: SafeUser
  createdById: string
  body: string
  metadata: any
  idea: SafeIdea
  ideaId: string
}

export interface SafeFeedback {
  id: string
  comment: string
  createdAt: Date
  contentDraftId: string
  createdById: string
  createdBy: SafeUser
}

export interface SafeMedia {
  id: string
  url: string
  filename: string
  contentType: string
  size: number
  createdAt: Date
  contentDraftId: string
  uploadedById: string
}

// Extended types for complex data structures
export interface SafeContentDraftWithRelations extends SafeContentDraft {
  feedbacks: SafeFeedback[]
  media: SafeMedia[]
}

export interface SafeIdeaWithRelations extends SafeIdea {
  contentDrafts: SafeContentDraftWithRelations[]
} 