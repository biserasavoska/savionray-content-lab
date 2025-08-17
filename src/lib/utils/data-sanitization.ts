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
    Idea: {
      ...draft.Idea,
      User: {
        ...draft.Idea?.User,
        email: draft.Idea?.User?.email ?? '',
        name: draft.Idea?.User?.name ?? '',
      }
    },
    User: {
      ...draft.User,
      email: draft.User?.email ?? '',
      name: draft.User?.name ?? '',
    },
    Feedback: (draft.Feedback || []).map((fb: any) => ({
      ...fb,
      contentDraftId: fb.contentDraftId ?? '',
      User: {
        ...fb.User,
        email: fb.User?.email ?? '',
        name: fb.User?.name ?? '',
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