import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSocialContent } from '@/lib/openai'

interface ContentSuggestion {
  id: string
  type: 'title' | 'description' | 'hashtag' | 'tone' | 'optimization'
  content: string
  confidence: number
  reasoning?: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, contentType, targetAudience, brandVoice } = body

    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Content and content type are required' },
        { status: 400 }
      )
    }

    // Generate AI suggestions based on content type
    const suggestions: ContentSuggestion[] = []

    // Title suggestions
    if (content.length > 10) {
      try {
        const titleResponse = await generateSocialContent({
          title: 'Generate engaging titles',
          description: `Based on this content: "${content.substring(0, 200)}...", generate 3 engaging titles for ${contentType} content targeting ${targetAudience} with a ${brandVoice} tone.`,
          format: 'title-suggestions',
          model: 'gpt-4o-mini'
        })

        const titles = titleResponse.postText.split('\n').filter(t => t.trim()).slice(0, 3)
        titles.forEach((title, index) => {
          suggestions.push({
            id: `title-${index}`,
            type: 'title',
            content: title.replace(/^\d+\.\s*/, '').trim(),
            confidence: 0.85 - (index * 0.1),
            reasoning: 'AI-generated title based on content analysis and target audience'
          })
        })
      } catch (error) {
        console.error('Error generating title suggestions:', error)
      }
    }

    // Hashtag suggestions
    try {
      const hashtagResponse = await generateSocialContent({
        title: 'Generate relevant hashtags',
        description: `Generate 5-8 relevant hashtags for this ${contentType} content: "${content.substring(0, 300)}...". Target audience: ${targetAudience}.`,
        format: 'hashtag-suggestions',
        model: 'gpt-4o-mini'
      })

      const hashtags = hashtagResponse.hashtags.slice(0, 8)
      hashtags.forEach((hashtag, index) => {
        suggestions.push({
          id: `hashtag-${index}`,
          type: 'hashtag',
          content: `#${hashtag}`,
          confidence: 0.9 - (index * 0.05),
          reasoning: 'AI-generated hashtag based on content relevance and trending topics'
        })
      })
    } catch (error) {
      console.error('Error generating hashtag suggestions:', error)
    }

    // Tone suggestions
    const toneSuggestions = [
      { tone: 'professional', confidence: 0.8, reasoning: 'Professional tone works well for business content' },
      { tone: 'conversational', confidence: 0.75, reasoning: 'Conversational tone increases engagement' },
      { tone: 'enthusiastic', confidence: 0.7, reasoning: 'Enthusiastic tone can boost excitement' }
    ]

    toneSuggestions.forEach((suggestion, index) => {
      suggestions.push({
        id: `tone-${index}`,
        type: 'tone',
        content: suggestion.tone,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      })
    })

    // Optimization suggestions
    const wordCount = content.split(/\s+/).length
    const optimizationSuggestions: ContentSuggestion[] = []

    if (wordCount < 50) {
      optimizationSuggestions.push({
        id: 'opt-length',
        type: 'optimization',
        content: 'Consider adding more detail to increase engagement',
        confidence: 0.9,
        reasoning: 'Content is quite short and may benefit from additional context'
      })
    } else if (wordCount > 500) {
      optimizationSuggestions.push({
        id: 'opt-length',
        type: 'optimization',
        content: 'Consider breaking this into shorter, more digestible sections',
        confidence: 0.85,
        reasoning: 'Long content may lose reader attention'
      })
    }

    if (!content.includes('?')) {
      optimizationSuggestions.push({
        id: 'opt-questions',
        type: 'optimization',
        content: 'Add questions to increase engagement and encourage responses',
        confidence: 0.8,
        reasoning: 'Questions can boost interaction and comments'
      })
    }

    if (!content.includes('!')) {
      optimizationSuggestions.push({
        id: 'opt-excitement',
        type: 'optimization',
        content: 'Consider adding exclamation marks to convey excitement',
        confidence: 0.7,
        reasoning: 'Excitement can make content more engaging'
      })
    }

    suggestions.push(...optimizationSuggestions)

    // Sort suggestions by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10) // Limit to top 10 suggestions
    })
  } catch (error) {
    console.error('Error in content suggestions API:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
} 