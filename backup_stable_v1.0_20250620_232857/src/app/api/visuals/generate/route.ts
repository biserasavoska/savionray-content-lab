import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createApi } from 'unsplash-js'

// Initialize Unsplash client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

// Log if API key is loaded (safely)
console.log('Unsplash API key loaded:', process.env.UNSPLASH_ACCESS_KEY ? 'Yes' : 'No')

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { ideaId, prompt, service, templateId, searchQuery } = body

    // Validate required fields
    if (!ideaId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Get the idea to ensure it exists and user has access
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    })

    if (!idea) {
      return new NextResponse('Idea not found', { status: 404 })
    }

    let imageUrl: string
    let metadata: any = {}

    // Generate or fetch image based on selected service
    switch (service) {
      case 'unsplash':
        if (!searchQuery) {
          return new NextResponse('Search query required for Unsplash', { status: 400 })
        }
        console.log('Making Unsplash API call with query:', searchQuery)
        try {
          const unsplashResponse = await unsplash.search.getPhotos({
            query: searchQuery,
            perPage: 1,
            orientation: 'landscape',
          })
          
          console.log('Unsplash API response:', JSON.stringify(unsplashResponse, null, 2))
          
          if (!unsplashResponse.response?.results?.[0]) {
            return new NextResponse('No images found', { status: 404 })
          }

          const photo = unsplashResponse.response.results[0]
          imageUrl = photo.urls.regular
          metadata = {
            service: 'unsplash',
            photoId: photo.id,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
            downloadLocation: photo.links.download_location,
          }
        } catch (unsplashError: any) {
          console.error('Unsplash API error:', unsplashError)
          return new NextResponse(`Unsplash API error: ${unsplashError.message}`, { status: 500 })
        }
        break

      case 'canva':
        if (!templateId) {
          return new NextResponse('Template ID required for Canva', { status: 400 })
        }
        // TODO: Implement Canva Brand Templates API integration
        // This will require setting up Canva API credentials and implementing their API
        return new NextResponse('Canva integration not implemented yet', { status: 501 })

      case 'adobe':
        // TODO: Implement Adobe Creative Cloud API integration
        // This will require setting up Adobe API credentials and implementing their API
        return new NextResponse('Adobe integration not implemented yet', { status: 501 })

      default:
        return new NextResponse('Invalid service selected', { status: 400 })
    }

    // Create a new visual draft
    try {
      console.log('Creating visual draft with data:', {
        ideaId,
        createdById: session.user.id,
        imageUrl,
        metadata,
        status: 'PENDING_REVIEW',
      })

      const visualDraft = await prisma.visualDraft.create({
        data: {
          ideaId,
          createdById: session.user.id,
          imageUrl,
          metadata,
          status: 'PENDING_REVIEW',
        },
      })

      return NextResponse.json(visualDraft)
    } catch (prismaError: any) {
      console.error('Prisma error creating visual draft:', prismaError)
      return new NextResponse(`Database error: ${prismaError.message}`, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error generating visual:', error)
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
} 