import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const formData = await req.formData()
    const file = formData.get('file') as File
    const contentDraftId = formData.get('contentDraftId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!contentDraftId) {
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

    const fileName = `${Date.now()}-${file.name}`
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024], // up to 5MB
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Fields: {
        'Content-Type': file.type,
      },
      Expires: 600, // URL expires in 10 minutes
    })

    // Upload to S3
    const formDataForS3 = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formDataForS3.append(key, value)
    })
    formDataForS3.append('file', file)

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formDataForS3,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to S3')
    }

    const fileUrl = `${url}/${fileName}`

    // Save media information to database
    const media = await prisma.media.create({
      data: {
        url: fileUrl,
        filename: fileName,
        contentType: file.type,
        size: file.size,
        uploadedById: session.user.id,
        contentDraftId,
        organizationId: orgContext.organizationId,
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 