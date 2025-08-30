'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import { 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Lightbulb,
  Target,
  Clock,
  Zap,
  Search,
  FileText,
  MessageSquare,
  Mail,
  Globe
} from 'lucide-react'

interface AISuggestion {
  id: string
  type: 'content' | 'idea' | 'optimization' | 'trend'
  title: string
  description: string
  action: string
  priority: 'high' | 'medium' | 'low'
  contentType?: string
}

interface AINavigationEnhancementProps {
  className?: string
}

export default function AINavigationEnhancement({ className }: AINavigationEnhancementProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    if (showAI) {
      loadAISuggestions()
    }
  }, [showAI])

  const loadAISuggestions = async () => {
    setIsLoading(true)
    try {
      // Mock AI suggestions - in real implementation, this would call an AI API
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'content',
          title: 'Create Weekly Newsletter',
          description: 'Based on recent trends, a weekly newsletter could boost engagement by 25%',
          action: 'Create Newsletter',
          priority: 'high',
          contentType: 'email'
        },
        {
          id: '2',
          type: 'idea',
          title: 'Social Media Campaign',
          description: 'AI detected trending topics that align with your brand',
          action: 'Start Campaign',
          priority: 'medium',
          contentType: 'social'
        },
        {
          id: '3',
          type: 'optimization',
          title: 'Content Performance Review',
          description: '3 pieces of content need optimization for better SEO',
          action: 'Review Content',
          priority: 'high'
        },
        {
          id: '4',
          type: 'trend',
          title: 'Industry Trend Alert',
          description: 'New trending keywords in your industry detected',
          action: 'Explore Trends',
          priority: 'medium'
        }
      ]
      
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('Failed to load AI suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionAction = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'content':
        if (suggestion.contentType === 'email') {
          router.push('/create-content/ai-enhanced?type=email')
        } else if (suggestion.contentType === 'social') {
          router.push('/create-content/ai-enhanced?type=social')
        } else {
          router.push('/create-content/ai-enhanced')
        }
        break
      case 'idea':
        router.push('/ideas/new')
        break
      case 'optimization':
        router.push('/content-review')
        break
      case 'trend':
        router.push('/analytics')
        break
      default:
        break
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'content': return <FileText className="w-4 h-4" />
      case 'idea': return <Lightbulb className="w-4 h-4" />
      case 'optimization': return <Target className="w-4 h-4" />
      case 'trend': return <TrendingUp className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <div className={className}>
      {/* AI Assistant Toggle */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowAI(!showAI)}
        className="w-full mb-4"
        
      >
        AI Assistant
        {showAI && <Badge variant="default" className="ml-2">Active</Badge>}
      </Button>

      {/* AI Suggestions Panel */}
      {showAI && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <h3 className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                AI Suggestions
              </span>
              {isLoading && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                  Loading...
                </div>
              )}
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 border rounded-lg hover:border-purple-300 transition-all cursor-pointer"
                  onClick={() => handleSuggestionAction(suggestion)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSuggestionIcon(suggestion.type)}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <Clock className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    
                  >
                    {suggestion.action}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                {isLoading ? 'Loading suggestions...' : 'No suggestions available'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm">Quick Actions</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push('/create-content/ai-enhanced')}
            
          >
            AI Content Creation
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push('/ideas/new')}
            
          >
            New Idea
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push('/content-review')}
            
          >
            Review Content
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.push('/analytics')}
            
          >
            Analytics Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 