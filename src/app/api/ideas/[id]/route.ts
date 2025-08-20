import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireOrganizationContext(undefined, request)
    
    const idea = await prisma.idea.findFirst({
      where: {
        id: params.id,
        organizationId: context.organizationId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireOrganizationContext(undefined, request)
    const body = await request.json()
    
    // Check if this is a status-only update or a full update
    if (body.status && Object.keys(body).length === 1) {
      // Status-only update (existing functionality)
      const { status } = body
      
      if (!status) {
        return NextResponse.json(
          { error: 'Status is required' },
          { status: 400 }
        )
      }

      // Validate status
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      const idea = await prisma.idea.findFirst({
        where: {
          id: params.id,
          organizationId: context.organizationId,
        },
      })

      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        )
      }

      const updatedIdea = await prisma.idea.update({
        where: { id: params.id },
        data: { status },
        include: {
          User: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      // If the idea is being approved, automatically create a content draft
      if (status === 'APPROVED') {
        try {
          // Create a content draft from the approved idea
          await prisma.contentDraft.create({
            data: {
              status: 'DRAFT',
              body: '', // Empty body to be filled by creative team
              metadata: {
                ideaId: params.id,
                contentType: updatedIdea.contentType,
                mediaType: updatedIdea.mediaType,
                publishingDateTime: updatedIdea.publishingDateTime,
                source: 'approved_idea'
              },
              ideaId: params.id,
              contentType: updatedIdea.contentType,
              createdById: context.userId,
              organizationId: context.organizationId,
            },
          })
          
          console.log(`Content draft created for approved idea: ${params.id}`)
        } catch (draftError) {
          console.error('Failed to create content draft for approved idea:', draftError)
          // Don't fail the approval if draft creation fails
          // The idea is still approved, just without automatic draft creation
        }
      }

      return NextResponse.json(updatedIdea)
    } else {
      // Full idea update
      const { title, description, contentType, mediaType, publishingDateTime, savedForLater } = body
      
      if (!title || !description) {
        return NextResponse.json(
          { error: 'Title and description are required' },
          { status: 400 }
        )
      }

      // Map form values to Prisma enum values
      const mapContentType = (type: string) => {
        switch (type) {
          case 'social-media': return 'SOCIAL_MEDIA_POST'
          case 'newsletter': return 'NEWSLETTER'
          case 'blog-post': return 'BLOG_POST'
          case 'website-copy': return 'WEBSITE_COPY'
          case 'email-campaign': return 'EMAIL_CAMPAIGN'
          default: return 'SOCIAL_MEDIA_POST'
        }
      }

      const mapMediaType = (type: string) => {
        switch (type) {
          case 'image': return 'PHOTO'
          case 'video': return 'VIDEO'
          case 'infographic': return 'GRAPH_OR_INFOGRAPHIC'
          case 'social-card': return 'SOCIAL_CARD'
          case 'poll': return 'POLL'
          case 'carousel': return 'CAROUSEL'
          default: return 'SOCIAL_CARD'
        }
      }

      const idea = await prisma.idea.findFirst({
        where: {
          id: params.id,
          organizationId: context.organizationId,
        },
      })

      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        )
      }

      const updatedIdea = await prisma.idea.update({
        where: { id: params.id },
        data: {
          title,
          description,
          contentType: mapContentType(contentType),
          mediaType: mapMediaType(mediaType),
          publishingDateTime: publishingDateTime ? new Date(publishingDateTime) : null,
          savedForLater: savedForLater || false,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json(updatedIdea)
    }
  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireOrganizationContext(undefined, request)
    
    const idea = await prisma.idea.findFirst({
      where: {
        id: params.id,
        organizationId: context.organizationId,
      },
    })

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    await prisma.idea.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Idea deleted successfully' })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
