import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isCreative } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { CONTENT_TYPE } from '@/lib/utils/enum-constants'
import { validateSessionUser } from '@/lib/utils/session-validation'

// Helper function to create organization filter
function createOrgFilter(organizationId: string) {
  return {
    organizationId: organizationId,
  }
}

export async function POST(req: NextRequest) {
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
    const realUserId = validation.realUserId!
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    const { body, ideaId, contentType, metadata } = await req.json()

    if (!body || !contentType || !Object.values(CONTENT_TYPE).includes(contentType)) {
      return NextResponse.json({ error: 'Valid content type is required' }, { status: 400 })
    }

    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const draft = await prisma.contentDraft.create({
      data: {
        body,
        ideaId,
        contentType: contentType as any,
        status: 'DRAFT',
        createdById: realUserId,
        organizationId: orgContext.organizationId,
        metadata: metadata || {},
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Failed to create draft:', error)
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url)
  const ideaId = searchParams.get('ideaId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')
  const skip = (page - 1) * limit

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);
    
    const where = {
      ...(ideaId ? { ideaId } : {}),
      ...(validation.userRole === 'CREATIVE' ? { createdById: realUserId } : {}),
      ...createOrgFilter(orgContext.organizationId), // Add organization filter
    }

    const [drafts, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        include: {
          User: {
            select: {
              name: true,
              email: true,
            },
          },
          Idea: {
            select: {
              title: true,
              status: true,
              publishingDateTime: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.contentDraft.count({ where }),
    ])
    
    // Sort chronologically by publishing date (handle nulls properly)
    drafts.sort((a, b) => {
      // Get publishing date (or fallback to idea createdAt, or draft createdAt)
      const getDate = (draft: typeof drafts[0]) => {
        if (draft.Idea?.publishingDateTime) {
          return new Date(draft.Idea.publishingDateTime).getTime();
        }
        if (draft.Idea?.createdAt) {
          return new Date(draft.Idea.createdAt).getTime();
        }
        return new Date(draft.createdAt).getTime();
      };
      
      const dateA = getDate(a);
      const dateB = getDate(b);
      
      return dateA - dateB; // Ascending order (oldest first)
    });

    return NextResponse.json({
      drafts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
} 