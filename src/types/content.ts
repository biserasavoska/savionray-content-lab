export type UserRole = 'CREATIVE' | 'CLIENT' | 'ADMIN'

export type ContentStatus = 'DRAFT' | 'AWAITING_FEEDBACK' | 'AWAITING_REVISION' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
export type IdeaStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ContentType = 'NEWSLETTER' | 'BLOG_POST' | 'SOCIAL_MEDIA_POST' | 'WEBSITE_COPY' | 'EMAIL_CAMPAIGN'
export type MediaType = 'PHOTO' | 'GRAPH_OR_INFOGRAPHIC' | 'VIDEO' | 'SOCIAL_CARD' | 'POLL' | 'CAROUSEL'

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  image?: string | null
}

export interface Idea {
  id: string
  title: string
  description: string
  status: IdeaStatus
  publishingDateTime: Date | null
  savedForLater: boolean
  mediaType: MediaType | null
  createdAt: Date
  updatedAt: Date
  createdBy: User
  createdById: string
  contentType: ContentType | null
  deliveryItemId?: string | null
}

export interface ContentDraft {
  id: string
  status: ContentStatus
  contentType: ContentType
  createdAt: Date
  updatedAt: Date
  createdBy: User
  createdById: string
  body: string
  metadata: any
  idea: Idea
  ideaId: string
}

export interface Media {
  id: string
  url: string
  filename: string
  contentType: string
  size: number
  createdAt: Date
  contentDraftId: string
  uploadedById: string
}

export interface FilterOptions {
  status?: string
  contentType?: string
  month?: string
  search?: string
}

export interface DashboardTab {
  id: 'ideas' | 'content-review' | 'published'
  label: string
  count?: number
}

export interface Feedback {
  id: string
  comment: string
  createdAt: Date
  contentDraftId: string | null
  createdById: string
  createdBy: User
} 