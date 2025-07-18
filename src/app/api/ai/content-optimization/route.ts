import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSocialContent } from '@/lib/openai'

interface ContentOptimization {
  seoScore: number
  readabilityScore: number
  engagementScore: number
  suggestions: string[]
  toneAnalysis: {
    current: string
    suggested: string
    reasoning: string
  }
  brandConsistency: {
    score: number
    issues: string[]
    improvements: string[]
  }
}

// Simple readability analysis
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = countSyllables(text)
  
  if (sentences.length === 0 || words.length === 0) return 0
  
  const avgSentenceLength = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  // Flesch Reading Ease formula
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  
  // Normalize to 0-100 scale
  return Math.max(0, Math.min(100, fleschScore))
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  let count = 0
  
  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '')
    if (word.length <= 3) {
      count += 1
    } else {
      count += word.replace(/[^aeiouy]+/g, '').length
    }
  })
  
  return count
}

// SEO analysis
function calculateSEOScore(text: string): number {
  let score = 0
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = words.length
  
  // Length score (optimal: 150-300 words)
  if (wordCount >= 150 && wordCount <= 300) {
    score += 30
  } else if (wordCount >= 100 && wordCount <= 500) {
    score += 20
  } else {
    score += 10
  }
  
  // Question marks (engagement)
  const questionCount = (text.match(/\?/g) || []).length
  score += Math.min(20, questionCount * 5)
  
  // Exclamation marks (excitement)
  const exclamationCount = (text.match(/!/g) || []).length
  score += Math.min(15, exclamationCount * 3)
  
  // Hashtags (social media optimization)
  const hashtagCount = (text.match(/#\w+/g) || []).length
  score += Math.min(15, hashtagCount * 3)
  
  // Call to action
  const ctaWords = ['click', 'learn', 'discover', 'get', 'try', 'start', 'join', 'sign up', 'download']
  const hasCTA = ctaWords.some(word => text.toLowerCase().includes(word))
  if (hasCTA) score += 20
  
  return Math.min(100, score)
}

// Engagement analysis
function calculateEngagementScore(text: string): number {
  let score = 0
  
  // Length (optimal engagement length)
  const wordCount = text.split(/\s+/).length
  if (wordCount >= 50 && wordCount <= 200) {
    score += 25
  } else if (wordCount >= 25 && wordCount <= 300) {
    score += 15
  } else {
    score += 5
  }
  
  // Questions (encourage interaction)
  const questionCount = (text.match(/\?/g) || []).length
  score += Math.min(25, questionCount * 8)
  
  // Personal pronouns (connection)
  const personalPronouns = (text.match(/\b(you|your|we|our|us|i|me|my)\b/gi) || []).length
  score += Math.min(20, personalPronouns * 2)
  
  // Emojis or emotional language
  const emotionalWords = ['amazing', 'incredible', 'fantastic', 'awesome', 'great', 'love', 'excited', 'thrilled']
  const emotionalCount = emotionalWords.filter(word => text.toLowerCase().includes(word)).length
  score += Math.min(15, emotionalCount * 3)
  
  // Call to action
  const ctaWords = ['click', 'learn', 'discover', 'get', 'try', 'start', 'join', 'sign up', 'download']
  const hasCTA = ctaWords.some(word => text.toLowerCase().includes(word))
  if (hasCTA) score += 15
  
  return Math.min(100, score)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, contentType, targetAudience, brandVoice } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Calculate scores
    const seoScore = calculateSEOScore(content)
    const readabilityScore = calculateReadabilityScore(content)
    const engagementScore = calculateEngagementScore(content)

    // Generate AI-powered tone analysis
    const toneAnalysis = {
      current: 'neutral',
      suggested: 'professional',
      reasoning: 'Default tone analysis'
    }

    try {
      const toneResponse = await generateSocialContent({
        title: 'Analyze content tone',
        description: `Analyze the tone of this content: "${content.substring(0, 300)}...". 
        Content type: ${contentType}
        Target audience: ${targetAudience}
        Brand voice: ${brandVoice}
        
        Provide the current tone and suggest improvements.`,
        format: 'tone-analysis',
        model: 'gpt-4o-mini'
      })

      // Parse tone analysis from AI response
      const toneText = toneResponse.postText.toLowerCase()
      
      if (toneText.includes('professional')) {
        toneAnalysis.current = 'professional'
      } else if (toneText.includes('conversational') || toneText.includes('casual')) {
        toneAnalysis.current = 'conversational'
      } else if (toneText.includes('enthusiastic') || toneText.includes('excited')) {
        toneAnalysis.current = 'enthusiastic'
      }

      toneAnalysis.reasoning = toneResponse.postText.substring(0, 200) + '...'
    } catch (error) {
      console.error('Error analyzing tone:', error)
    }

    // Brand consistency analysis
    const brandConsistency = {
      score: 75, // Default score
      issues: [] as string[],
      improvements: [] as string[]
    }

    // Check for brand consistency issues
    if (content.length < 50) {
      brandConsistency.issues.push('Content is too short for brand voice')
      brandConsistency.improvements.push('Add more detail to better reflect brand voice')
    }

    if (!content.includes('?')) {
      brandConsistency.improvements.push('Add questions to increase engagement')
    }

    if (content.length > 500) {
      brandConsistency.issues.push('Content may be too long for target audience')
      brandConsistency.improvements.push('Consider breaking into shorter sections')
    }

    // Adjust brand consistency score based on issues
    brandConsistency.score = Math.max(0, 75 - (brandConsistency.issues.length * 10))

    // Generate optimization suggestions
    const suggestions: string[] = []

    if (seoScore < 70) {
      suggestions.push('Add more call-to-action phrases to improve SEO')
    }

    if (readabilityScore < 60) {
      suggestions.push('Use shorter sentences to improve readability')
    }

    if (engagementScore < 60) {
      suggestions.push('Add questions to encourage audience interaction')
    }

    if (!content.includes('#')) {
      suggestions.push('Add relevant hashtags to increase discoverability')
    }

    if (content.length < 100) {
      suggestions.push('Consider adding more detail to provide value to readers')
    }

    // Add AI-generated suggestions
    try {
      const aiResponse = await generateSocialContent({
        title: 'Generate optimization suggestions',
        description: `Provide 3 specific suggestions to improve this ${contentType} content: "${content.substring(0, 200)}...". 
        Focus on engagement, clarity, and audience appeal.`,
        format: 'optimization-suggestions',
        model: 'gpt-4o-mini'
      })

      const aiSuggestions = aiResponse.postText.split('\n').filter(s => s.trim()).slice(0, 3)
      suggestions.push(...aiSuggestions.map(s => s.replace(/^\d+\.\s*/, '').trim()))
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    }

    const optimization: ContentOptimization = {
      seoScore,
      readabilityScore,
      engagementScore,
      suggestions: suggestions.slice(0, 5), // Limit to top 5 suggestions
      toneAnalysis,
      brandConsistency
    }

    return NextResponse.json(optimization)
  } catch (error) {
    console.error('Error in content optimization API:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
} 