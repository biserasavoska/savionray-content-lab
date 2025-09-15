import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSessionUser } from '@/lib/utils/session-validation'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function GET(req: NextRequest) {
  const validation = await validateSessionUser()

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, req)
    const url = new URL(req.url)
    const contentDraftId = url.searchParams.get('contentDraftId')

    if (!contentDraftId) {
      return NextResponse.json(
        { error: 'Content draft ID is required' },
        { status: 400 }
      )
    }

    // Fetch media for the specific content draft
    const media = await prisma.media.findMany({
      where: {
        contentDraftId,
        organizationId: orgContext.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to fetch media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const validation = await validateSessionUser()

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, req)
    const { mediaId } = await req.json()

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }

    // Delete the media record
    await prisma.media.delete({
      where: {
        id: mediaId,
        organizationId: orgContext.organizationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
