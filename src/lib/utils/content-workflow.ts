/**
 * Content Workflow System
 * Defines the complete workflow from Idea to Delivery completion
 */

export enum ContentWorkflowStage {
  IDEA = 'IDEA',
  DRAFT = 'DRAFT',
  CONTENT_REVIEW = 'CONTENT_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  DELIVERED = 'DELIVERED'
}

export enum ContentWorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface WorkflowTransition {
  from: ContentWorkflowStage | ContentWorkflowStatus
  to: ContentWorkflowStage | ContentWorkflowStatus
  action: string
  description: string
  requiredRole?: string[]
  autoTransition?: boolean
}

export interface ContentWorkflowState {
  currentStage: ContentWorkflowStage
  currentStatus: ContentWorkflowStatus
  canTransition: (to: ContentWorkflowStage | ContentWorkflowStatus) => boolean
  getNextStages: () => (ContentWorkflowStage | ContentWorkflowStatus)[]
  getTransitions: () => WorkflowTransition[]
}

/**
 * Define the complete content workflow transitions
 */
export const CONTENT_WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Idea stage transitions
  {
    from: ContentWorkflowStage.IDEA,
    to: ContentWorkflowStage.DRAFT,
    action: 'create_draft',
    description: 'Create content draft from idea',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  {
    from: ContentWorkflowStage.IDEA,
    to: ContentWorkflowStatus.REJECTED,
    action: 'reject_idea',
    description: 'Reject the idea',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  
  // Draft stage transitions
  {
    from: ContentWorkflowStage.DRAFT,
    to: ContentWorkflowStage.CONTENT_REVIEW,
    action: 'submit_for_review',
    description: 'Submit draft for review',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  {
    from: ContentWorkflowStage.DRAFT,
    to: ContentWorkflowStage.DRAFT,
    action: 'revise_draft',
    description: 'Revise draft based on feedback',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  {
    from: ContentWorkflowStage.DRAFT,
    to: ContentWorkflowStatus.REJECTED,
    action: 'reject_draft',
    description: 'Reject the draft',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  
  // Content Review stage transitions
  {
    from: ContentWorkflowStage.CONTENT_REVIEW,
    to: ContentWorkflowStage.APPROVED,
    action: 'approve_content',
    description: 'Approve content for publication',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  {
    from: ContentWorkflowStage.CONTENT_REVIEW,
    to: ContentWorkflowStage.DRAFT,
    action: 'request_revision',
    description: 'Request revision of content',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  {
    from: ContentWorkflowStage.CONTENT_REVIEW,
    to: ContentWorkflowStatus.REJECTED,
    action: 'reject_content',
    description: 'Reject the content',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  
  // Approved stage transitions
  {
    from: ContentWorkflowStage.APPROVED,
    to: ContentWorkflowStage.PUBLISHED,
    action: 'publish_content',
    description: 'Publish the content',
    requiredRole: ['CREATIVE', 'ADMIN'],
    autoTransition: true
  },
  
  // Published stage transitions
  {
    from: ContentWorkflowStage.PUBLISHED,
    to: ContentWorkflowStage.DELIVERED,
    action: 'mark_delivered',
    description: 'Mark content as delivered to client',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  
  // Status transitions
  {
    from: ContentWorkflowStatus.PENDING,
    to: ContentWorkflowStatus.IN_PROGRESS,
    action: 'start_work',
    description: 'Start working on content',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  {
    from: ContentWorkflowStatus.IN_PROGRESS,
    to: ContentWorkflowStatus.REVIEW,
    action: 'submit_for_review',
    description: 'Submit for review',
    requiredRole: ['CREATIVE', 'ADMIN']
  },
  {
    from: ContentWorkflowStatus.REVIEW,
    to: ContentWorkflowStatus.APPROVED,
    action: 'approve',
    description: 'Approve content',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  {
    from: ContentWorkflowStatus.REVIEW,
    to: ContentWorkflowStatus.IN_PROGRESS,
    action: 'request_changes',
    description: 'Request changes',
    requiredRole: ['ADMIN', 'CLIENT']
  },
  {
    from: ContentWorkflowStatus.APPROVED,
    to: ContentWorkflowStatus.PUBLISHED,
    action: 'publish',
    description: 'Publish content',
    requiredRole: ['CREATIVE', 'ADMIN'],
    autoTransition: true
  },
  {
    from: ContentWorkflowStatus.PUBLISHED,
    to: ContentWorkflowStatus.DELIVERED,
    action: 'deliver',
    description: 'Mark as delivered',
    requiredRole: ['CREATIVE', 'ADMIN']
  }
]

/**
 * Get workflow state for a content item
 */
export function getContentWorkflowState(
  currentStage: string,
  currentStatus: string,
  userRole: string
): ContentWorkflowState {
  const stage = currentStage as ContentWorkflowStage
  const status = currentStatus as ContentWorkflowStatus
  
  const canTransition = (to: ContentWorkflowStage | ContentWorkflowStatus): boolean => {
    return CONTENT_WORKFLOW_TRANSITIONS.some(transition => 
      (transition.from === stage || transition.from === status) &&
      transition.to === to &&
      (!transition.requiredRole || transition.requiredRole.includes(userRole))
    )
  }
  
  const getNextStages = (): (ContentWorkflowStage | ContentWorkflowStatus)[] => {
    return CONTENT_WORKFLOW_TRANSITIONS
      .filter(transition => 
        (transition.from === stage || transition.from === status) &&
        (!transition.requiredRole || transition.requiredRole.includes(userRole))
      )
      .map(transition => transition.to)
  }
  
  const getTransitions = (): WorkflowTransition[] => {
    return CONTENT_WORKFLOW_TRANSITIONS.filter(transition => 
      (transition.from === stage || transition.from === status) &&
      (!transition.requiredRole || transition.requiredRole.includes(userRole))
    )
  }
  
  return {
    currentStage: stage,
    currentStatus: status,
    canTransition,
    getNextStages,
    getTransitions
  }
}

/**
 * Execute a workflow transition
 */
export function executeWorkflowTransition(
  fromStage: string,
  fromStatus: string,
  toStage: string,
  toStatus: string,
  userRole: string,
  action: string
): { success: boolean; error?: string } {
  const transition = CONTENT_WORKFLOW_TRANSITIONS.find(t => 
    (t.from === fromStage || t.from === fromStatus) &&
    (t.to === toStage || t.to === toStatus) &&
    t.action === action &&
    (!t.requiredRole || t.requiredRole.includes(userRole))
  )
  
  if (!transition) {
    return {
      success: false,
      error: `Invalid transition from ${fromStage}/${fromStatus} to ${toStage}/${toStatus} with action ${action}`
    }
  }
  
  return { success: true }
}

/**
 * Get delivery progress based on content workflow
 */
export function calculateDeliveryProgress(contentItems: any[]): {
  total: number
  completed: number
  inProgress: number
  inReview: number
  approved: number
  published: number
  delivered: number
  progress: number
} {
  const total = contentItems.length
  const completed = contentItems.filter(item => 
    item.status === 'DELIVERED' || 
    item.currentStage === ContentWorkflowStage.DELIVERED
  ).length
  
  const inProgress = contentItems.filter(item => 
    item.status === 'IN_PROGRESS' || 
    item.currentStage === ContentWorkflowStage.DRAFT
  ).length
  
  const inReview = contentItems.filter(item => 
    item.status === 'REVIEW' || 
    item.currentStage === ContentWorkflowStage.CONTENT_REVIEW
  ).length
  
  const approved = contentItems.filter(item => 
    item.status === 'APPROVED' || 
    item.currentStage === ContentWorkflowStage.APPROVED
  ).length
  
  const published = contentItems.filter(item => 
    item.status === 'PUBLISHED' || 
    item.currentStage === ContentWorkflowStage.PUBLISHED
  ).length
  
  const delivered = contentItems.filter(item => 
    item.status === 'DELIVERED' || 
    item.currentStage === ContentWorkflowStage.DELIVERED
  ).length
  
  const progress = total > 0 ? (delivered / total) * 100 : 0
  
  return {
    total,
    completed: delivered,
    inProgress,
    inReview,
    approved,
    published,
    delivered,
    progress: Math.round(progress)
  }
}

/**
 * Auto-transition content based on workflow rules
 */
export function autoTransitionContent(contentItem: any): {
  newStage?: string
  newStatus?: string
  shouldTransition: boolean
} {
  // Auto-transition from APPROVED to PUBLISHED
  if (contentItem.status === 'APPROVED' || contentItem.currentStage === ContentWorkflowStage.APPROVED) {
    return {
      newStage: ContentWorkflowStage.PUBLISHED,
      newStatus: ContentWorkflowStatus.PUBLISHED,
      shouldTransition: true
    }
  }
  
  return { shouldTransition: false }
}
