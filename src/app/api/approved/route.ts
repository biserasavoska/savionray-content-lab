import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { logger } from '@/lib/utils/logger'
import { validateSessionUser } from '@/lib/utils/session-validation'

// Helper function to sanitize content draft data
function sanitizeContentDraftsData(drafts: any[]) {
  return drafts.map(draft => ({
    id: draft.id,
    body: draft.body,
    status: draft.status,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    idea: draft.Idea ? {
      id: draft.Idea.id,
      title: draft.Idea.title,
      description: draft.Idea.description,
      contentType: draft.Idea.contentType,
      mediaType: draft.Idea.mediaType,
      createdBy: draft.Idea.User ? {
        id: draft.Idea.User.id,
        name: draft.Idea.User.name,
        email: draft.Idea.User.email,
        role: draft.Idea.User.role,
        image: draft.Idea.User.image
      } : null
    } : null,
    createdBy: draft.User ? {
      id: draft.User.id,
      name: draft.User.name,
      email: draft.User.email,
      role: draft.User.role,
      image: draft.User.image
    } : null,
    feedback: draft.Feedback?.map((fb: any) => ({
      id: fb.id,
      comment: fb.comment,
      createdAt: fb.createdAt,
      createdBy: fb.User ? {
        name: fb.User.name,
        email: fb.User.email
      } : null
    })) || [],
    media: draft.Media?.map((m: any) => ({
      id: m.id,
      url: m.url,
      filename: m.filename,
      contentType: m.contentType,
      size: m.size
    })) || []
  }))
}

export async function GET(request: NextRequest) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Fetch approved content
    const approvedContent = await prisma.contentDraft.findMany({
      where: {
        organizationId: orgContext.organizationId,
        status: DRAFT_STATUS.APPROVED
      },
      include: {
        Idea: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            }
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        Feedback: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        Media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.contentDraft.count({
      where: {
        organizationId: orgContext.organizationId,
        status: DRAFT_STATUS.APPROVED
      }
    })

    // Sanitize the data
    const safeContent = sanitizeContentDraftsData(approvedContent)

    logger.info('Approved content fetched', {
      userId: realUserId,
      userEmail: validation.userEmail,
      organizationId: orgContext.organizationId,
      contentCount: safeContent.length,
      totalCount,
      page,
      limit
    })

    return NextResponse.json({
      content: safeContent,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    logger.error('Error fetching approved content', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 