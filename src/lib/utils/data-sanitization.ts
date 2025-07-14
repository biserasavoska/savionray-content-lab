import { User, ContentDraft, Idea, Feedback, Media } from '@prisma/client'

import { 
  SafeUser, 
  SafeIdea, 
  SafeContentDraft, 
  SafeFeedback, 
  SafeMedia,
  SafeContentDraftWithRelations,
  SafeIdeaWithRelations
} from '@/types/safe-types'

/**
 * Sanitizes a User object to ensure all required fields are non-null
 */
export function sanitizeUser(user: User | null | undefined): SafeUser {
  if (!user) {
    throw new Error('User object is required for sanitization')
  }
  
  return {
    id: user.id,
    name: user.name ?? 'Unknown User',
    email: user.email ?? 'unknown@example.com',
    role: user.role,
    image: user.image
  }
}



/**
 * Sanitizes content draft data from Prisma queries
 * This handles the common pattern of null-patching in pages
 */
export function sanitizeContentDraftData(draft: any): any {
  return {
    ...draft,
    idea: {
      ...draft.idea,
      createdBy: {
        ...draft.idea.createdBy,
        email: draft.idea.createdBy.email ?? '',
        name: draft.idea.createdBy.name ?? '',
      }
    },
    createdBy: {
      ...draft.createdBy,
      email: draft.createdBy.email ?? '',
      name: draft.createdBy.name ?? '',
    },
    feedbacks: (draft.feedbacks || []).map((fb: any) => ({
      ...fb,
      contentDraftId: fb.contentDraftId ?? '',
      createdBy: {
        ...fb.createdBy,
        email: fb.createdBy.email ?? '',
        name: fb.createdBy.name ?? '',
      }
    }))
  }
}

/**
 * Sanitizes an array of content drafts
 */
export function sanitizeContentDraftsData(drafts: any[]): any[] {
  return drafts.map(sanitizeContentDraftData)
} 