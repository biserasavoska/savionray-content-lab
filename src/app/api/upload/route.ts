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

            console.log('🔍 DEBUG: Creating S3 upload...')
            const fileName = `${Date.now()}-${file.name}`
            console.log('🔍 DEBUG: File name:', fileName)
            console.log('🔍 DEBUG: Organization ID from context:', orgContext.organizationId)
            console.log('🔍 DEBUG: Content Draft ID:', contentDraftId)
            
            // Create S3 presigned post for file upload
            const { S3Client } = await import('@aws-sdk/client-s3')
            const { createPresignedPost } = await import('@aws-sdk/s3-presigned-post')
            
            const s3Client = new S3Client({
              region: process.env.AWS_REGION!,
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
              },
            })

            const { url, fields } = await createPresignedPost(s3Client, {
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: `uploads/${orgContext.organizationId}/${contentDraftId}/${fileName}`,
              Conditions: [
                ['content-length-range', 0, 5 * 1024 * 1024], // 5MB limit
              ],
              Fields: {
                'Content-Type': file.type,
              },
            })
            console.log('✅ S3 presigned post created')

            // Upload file to S3
            const uploadFormData = new FormData()
            Object.entries(fields).forEach(([key, value]) => {
              uploadFormData.append(key, value as string)
            })
            uploadFormData.append('file', file)

            const uploadResponse = await fetch(url, {
              method: 'POST',
              body: uploadFormData,
            })

            if (!uploadResponse.ok) {
              throw new Error(`S3 upload failed: ${uploadResponse.statusText}`)
            }

            const fileUrl = `${url}/${fields.key}`
            console.log('✅ File uploaded to S3:', fileUrl)

    // Save media information to database - ✅ Use REAL user ID
    const media = await prisma.media.create({
      data: {
        url: fileUrl,
        filename: fileName,
        contentType: file.type,
        size: file.size,
        uploadedById: realUserId,
        contentDraftId,
        organizationId: orgContext.organizationId,
      },
    })

    console.log('✅ Media saved to database:', {
      id: media.id,
      filename: media.filename,
      contentDraftId: media.contentDraftId,
      organizationId: media.organizationId
    })
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