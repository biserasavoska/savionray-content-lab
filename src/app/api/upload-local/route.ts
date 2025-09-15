import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 DEBUG: Local upload API called')
    
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

    // For now, just return a mock response to test the flow
    const mockMedia = {
      id: `mock-${Date.now()}`,
      url: `https://example.com/uploads/${file.name}`,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      contentDraftId,
      createdAt: new Date().toISOString()
    }

    console.log('✅ Mock upload successful:', mockMedia)
    return NextResponse.json(mockMedia)

  } catch (error) {
    console.error('❌ Local upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
