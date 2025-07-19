'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { Textarea } from '@/components/ui/Textarea'
import Badge from '@/components/ui/common/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  Wand2, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AIEnhancedEditorProps {
  content: string
  contentType: 'blog' | 'social' | 'email' | 'article'
  onContentChange: (content: string) => void
  onSave?: () => void
  placeholder?: string
  className?: string
}

interface AISuggestion {
  id: string
  type: 'title' | 'hashtag' | 'tone' | 'optimization' | 'expansion'
  content: string
  confidence: number
  reasoning: string
  applied: boolean
}

interface AIAnalysis {
  seoScore: number
  readabilityScore: number
  engagementScore: number
  toneAnalysis: {
    emotion: string
    confidence: number
    suggestions: string[]
  }
  brandConsistency: {
    score: number
    issues: string[]
    improvements: string[]
  }
}

export default function AIEnhancedEditor({
  content,
  contentType,
  onContentChange,
  onSave,
  placeholder = "Start writing your content...",
  className
}: AIEnhancedEditorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState('editor')
  const [showAI, setShowAI] = useState(false)

  // Debounced content analysis
  const debouncedAnalysis = useCallback(
    debounce(async (text: string) => {
      if (text.length < 50) return
      
      setIsAnalyzing(true)
      try {
        const [suggestionsRes, analysisRes] = await Promise.all([
          fetch('/api/ai/content-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text, contentType })
          }),
          fetch('/api/ai/content-optimization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text, contentType })
          })
        ])

        if (suggestionsRes.ok && analysisRes.ok) {
          const suggestionsData = await suggestionsRes.json()
          const analysisData = await analysisRes.json()
          
          setSuggestions(suggestionsData.suggestions.map((s: any) => ({
            ...s,
            applied: false
          })))
          setAnalysis(analysisData.optimization)
        }
      } catch (error) {
        console.error('AI analysis failed:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }, 1000),
    [contentType]
  )

  useEffect(() => {
    if (content.length > 50) {
      debouncedAnalysis(content)
    }
  }, [content, debouncedAnalysis])

  const applySuggestion = (suggestion: AISuggestion) => {
    let newContent = content
    
    switch (suggestion.type) {
      case 'title':
        // Add title at the beginning
        newContent = `# ${suggestion.content}\n\n${content}`
        break
      case 'hashtag':
        // Add hashtags at the end
        newContent = `${content}\n\n${suggestion.content}`
        break
      case 'optimization':
        // Replace content with optimized version
        newContent = suggestion.content
        break
      case 'expansion':
        // Add expansion at the end
        newContent = `${content}\n\n${suggestion.content}`
        break
      default:
        return
    }
    
    onContentChange(newContent)
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id ? { ...s, applied: true } : s
      )
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />
    if (score >= 60) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAI(!showAI)}
            className={cn(
              "transition-all duration-200",
              showAI && "bg-purple-50 border-purple-200 text-purple-700"
            )}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Assistant
            {showAI && <Badge variant="secondary" className="ml-2">Active</Badge>}
          </Button>
          {isAnalyzing && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </div>
          )}
        </div>
        
        {onSave && (
          <Button onClick={onSave} size="sm">
            Save Draft
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Content Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onContentChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[400px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Panel */}
        {showAI && (
          <div className="space-y-4">
            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      suggestion.applied
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:border-purple-300"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                                             <Badge variant="secondary" className="text-xs">
                         {suggestion.type}
                       </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Target className="w-3 h-3 mr-1" />
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                    <p className="text-sm mb-2">{suggestion.content}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.reasoning}
                    </p>
                    {!suggestion.applied && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    )}
                    {suggestion.applied && (
                      <div className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Applied
                      </div>
                    )}
                  </div>
                ))}
                
                {suggestions.length === 0 && !isAnalyzing && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Start writing to get AI suggestions
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {analysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    Content Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className={cn("text-lg font-semibold", getScoreColor(analysis.seoScore))}>
                        {analysis.seoScore}
                      </div>
                      <div className="text-xs text-muted-foreground">SEO</div>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-lg font-semibold", getScoreColor(analysis.readabilityScore))}>
                        {analysis.readabilityScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Readability</div>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-lg font-semibold", getScoreColor(analysis.engagementScore))}>
                        {analysis.engagementScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>

                  {/* Tone Analysis */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Tone Analysis</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{analysis.toneAnalysis.emotion}</span>
                      <span className="text-muted-foreground">
                        {Math.round(analysis.toneAnalysis.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Brand Consistency */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Brand Consistency</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Score: {analysis.brandConsistency.score}/100</span>
                      {getScoreIcon(analysis.brandConsistency.score)}
                    </div>
                    {analysis.brandConsistency.improvements.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {analysis.brandConsistency.improvements[0]}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 