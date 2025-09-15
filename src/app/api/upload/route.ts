import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { validateSessionUser } from '@/lib/utils/session-validation'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  console.log('🔍 DEBUG: Upload API called')
  
  // 🚨 CRITICAL: Use session validation utility to get REAL user ID
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    console.log('❌ Session validation failed:', validation.error)
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

  try {
    console.log('🔍 DEBUG: Getting organization context...')
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);
    console.log('✅ Organization context:', { organizationId: orgContext.organizationId })

    console.log('🔍 DEBUG: Parsing form data...')
    const formData = await req.formData()
    const file = formData.get('file') as File
    const contentDraftId = formData.get('contentDraftId') as string

    console.log('🔍 DEBUG: Form data parsed:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size,
      contentDraftId 
    })

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!contentDraftId) {
      console.log('❌ No content draft ID provided')
      return NextResponse.json({ error: 'Content draft ID is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    console.log('🔍 DEBUG: Creating mock upload response...')
    const fileName = `${Date.now()}-${file.name}`
    console.log('🔍 DEBUG: File name:', fileName)
    
    // TEMPORARY: Mock upload response to test the flow
    // Use a real placeholder service for image thumbnails
    let mockFileUrl
    if (file.type.startsWith('image/')) {
      // Use placeholder.com for images - this will actually show a thumbnail
      const dimensions = '300x200' // width x height
      mockFileUrl = `https://via.placeholder.com/${dimensions}/4F46E5/FFFFFF?text=${encodeURIComponent(file.name)}`
    } else {
      // For non-images, use a generic placeholder
      mockFileUrl = `https://via.placeholder.com/300x200/6B7280/FFFFFF?text=${encodeURIComponent(file.name.split('.')[0])}`
    }
    
    console.log('✅ Mock upload successful')

    // Save media information to database - ✅ Use REAL user ID
    const media = await prisma.media.create({
      data: {
        url: mockFileUrl,
        filename: fileName,
        contentType: file.type,
        size: file.size,
        uploadedById: realUserId,
        contentDraftId,
        organizationId: orgContext.organizationId,
      },
    })

    console.log('✅ Media saved to database:', media.id)
    return NextResponse.json(media)
  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 