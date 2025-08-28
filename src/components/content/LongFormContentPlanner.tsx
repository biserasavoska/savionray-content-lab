'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  Brain, 
  Upload, 
  Download, 
  Loader2, 
  Target, 
  Calendar,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Lightbulb
} from 'lucide-react'
import Button from '@/components/ui/common/Button'
import StatusBadge from '@/components/ui/common/StatusBadge'

interface ContentSection {
  id: string
  title: string
  description: string
  targetWordCount: number
  status: 'planned' | 'generating' | 'completed' | 'failed'
  content?: string
  insights?: string[]
}

interface ContextDocument {
  id: string
  name: string
  content: string
  type: 'brand_guidelines' | 'research' | 'competitor_analysis' | 'previous_content' | 'other'
  size: number
}

interface LongFormPlan {
  title: string
  description: string
  totalWordCount: number
  sections: ContentSection[]
  timeline: string
  targetAudience: string
  contentType: 'blog_post' | 'whitepaper' | 'case_study' | 'guide' | 'report'
}

export default function LongFormContentPlanner() {
  const { data: session } = useSession()
  const [plan, setPlan] = useState<LongFormPlan>({
    title: '',
    description: '',
    totalWordCount: 3000,
    sections: [],
    timeline: '1 week',
    targetAudience: 'Business professionals',
    contentType: 'blog_post'
  })
  const [contextDocuments, setContextDocuments] = useState<ContextDocument[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-5')
  const [activeTab, setActiveTab] = useState<'planning' | 'context' | 'generation' | 'preview'>('planning')

  const addSection = () => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      title: `Section ${plan.sections.length + 1}`,
      description: '',
      targetWordCount: 500,
      status: 'planned'
    }
    setPlan(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<ContentSection>) => {
    setPlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }))
  }

  const removeSection = (sectionId: string) => {
    setPlan(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const addContextDocument = (doc: Omit<ContextDocument, 'id'>) => {
    const newDoc: ContextDocument = {
      ...doc,
      id: `doc-${Date.now()}`
    }
    setContextDocuments(prev => [...prev, newDoc])
  }

  const generatePlan = async () => {
    if (!session?.user) return

    setIsGeneratingPlan(true)
    try {
      // Prepare context from all documents
      const contextContent = contextDocuments
        .map(doc => `[${doc.type}] ${doc.name}: ${doc.content}`)
        .join('\n\n---\n\n')

      const response = await fetch('/api/ai/strategic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: plan.title,
          audience: plan.targetAudience,
          goals: [
            `Create ${plan.contentType} of approximately ${plan.totalWordCount} words`,
            'Ensure comprehensive coverage of the topic',
            'Maintain engagement throughout the content',
            'Provide actionable insights'
          ],
          constraints: [
            `Timeline: ${plan.timeline}`,
            `Content type: ${plan.contentType}`,
            `Target audience: ${plan.targetAudience}`,
            'Professional tone and style',
            ...(contextContent ? [`Context: ${contextContent.substring(0, 5000)}...`] : [])
          ],
          model: selectedModel,
          includeReasoning: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Generate sections based on AI recommendations
        const suggestedSections: ContentSection[] = [
          {
            id: 'intro',
            title: 'Introduction',
            description: 'Hook readers and set the stage',
            targetWordCount: Math.floor(plan.totalWordCount * 0.1),
            status: 'planned'
          },
          {
            id: 'main-1',
            title: 'Key Concept 1',
            description: 'First main point or section',
            targetWordCount: Math.floor(plan.totalWordCount * 0.25),
            status: 'planned'
          },
          {
            id: 'main-2',
            title: 'Key Concept 2', 
            description: 'Second main point or section',
            targetWordCount: Math.floor(plan.totalWordCount * 0.25),
            status: 'planned'
          },
          {
            id: 'main-3',
            title: 'Key Concept 3',
            description: 'Third main point or section',
            targetWordCount: Math.floor(plan.totalWordCount * 0.25),
            status: 'planned'
          },
          {
            id: 'conclusion',
            title: 'Conclusion',
            description: 'Wrap up and call to action',
            targetWordCount: Math.floor(plan.totalWordCount * 0.15),
            status: 'planned'
          }
        ]

        setPlan(prev => ({
          ...prev,
          sections: suggestedSections
        }))
      }
    } catch (error) {
      console.error('Plan generation failed:', error)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const generateSectionContent = async (sectionId: string) => {
    const section = plan.sections.find(s => s.id === sectionId)
    if (!section || !session?.user) return

    updateSection(sectionId, { status: 'generating' })

    try {
      // Prepare comprehensive context
      const contextContent = contextDocuments
        .map(doc => `[${doc.type}] ${doc.name}: ${doc.content}`)
        .join('\n\n---\n\n')
      
      const previousSections = plan.sections
        .filter(s => s.content && s.id !== sectionId)
        .map(s => `## ${s.title}\n${s.content}`)
        .join('\n\n')

      const fullContext = `
CONTENT PLAN:
Title: ${plan.title}
Description: ${plan.description}
Target Audience: ${plan.targetAudience}
Content Type: ${plan.contentType}

CURRENT SECTION:
Title: ${section.title}
Description: ${section.description}
Target Word Count: ${section.targetWordCount}

CONTEXT DOCUMENTS:
${contextContent}

PREVIOUS SECTIONS:
${previousSections}

Please generate ${section.targetWordCount} words of engaging, professional content for this section that flows naturally with the existing content and incorporates the provided context.
      `.trim()

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: section.title,
          description: fullContext,
          format: 'long-form',
          model: selectedModel,
          verbosity: 'high',
          reasoningEffort: 'high',
          maxOutputTokens: Math.max(section.targetWordCount * 2, 4000)
        })
      })

      if (response.ok) {
        const data = await response.json()
        updateSection(sectionId, { 
          status: 'completed', 
          content: data.postText,
          insights: data.reasoning?.steps || []
        })
      } else {
        updateSection(sectionId, { status: 'failed' })
      }
    } catch (error) {
      console.error('Section generation failed:', error)
      updateSection(sectionId, { status: 'failed' })
    }
  }

  const generateAllContent = async () => {
    setIsGeneratingContent(true)
    
    for (const section of plan.sections) {
      if (section.status === 'planned') {
        await generateSectionContent(section.id)
        // Small delay between sections
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    setIsGeneratingContent(false)
  }

  const exportContent = () => {
    const fullContent = plan.sections
      .filter(s => s.content)
      .map(s => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n')
    
    const blob = new Blob([fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.title.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to use the Long-Form Content Planner.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-blue-600" />
          Long-Form Content Planner
        </h1>
        <p className="text-gray-600 mt-2">Create comprehensive content using GPT-5's 400K context window</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'planning', label: 'Planning', icon: Target },
            { id: 'context', label: 'Context', icon: Brain },
            { id: 'generation', label: 'Generation', icon: FileText },
            { id: 'preview', label: 'Preview', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'planning' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Content Plan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={plan.title}
                    onChange={(e) => setPlan(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter content title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={plan.description}
                    onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                    placeholder="Describe the content purpose and key points..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                    <select
                      value={plan.contentType}
                      onChange={(e) => setPlan(prev => ({ ...prev, contentType: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="blog_post">Blog Post</option>
                      <option value="whitepaper">Whitepaper</option>
                      <option value="case_study">Case Study</option>
                      <option value="guide">Guide</option>
                      <option value="report">Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word Count</label>
                    <input
                      type="number"
                      value={plan.totalWordCount}
                      onChange={(e) => setPlan(prev => ({ ...prev, totalWordCount: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      min="1000"
                      max="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={plan.targetAudience}
                    onChange={(e) => setPlan(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Business professionals, developers, etc."
                  />
                </div>

                <Button
                  onClick={generatePlan}
                  disabled={isGeneratingPlan || !plan.title}
                  variant="primary"
                  className="w-full flex items-center justify-center"
                >
                  {isGeneratingPlan ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingPlan ? 'Generating Plan...' : 'Generate AI Plan'}
                </Button>
              </div>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Sections</h2>
                <Button
                  onClick={addSection}
                  variant="success"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Section
                </Button>
              </div>

              <div className="space-y-3">
                {plan.sections.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No sections yet. Add sections manually or generate an AI plan.
                  </p>
                ) : (
                  plan.sections.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          {section.title}
                        </h3>
                        <Button
                          onClick={() => removeSection(section.id)}
                          variant="danger"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                        placeholder="Section title..."
                      />
                      
                      <textarea
                        value={section.description}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16 mb-2"
                        placeholder="Section description..."
                      />
                      
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          value={section.targetWordCount}
                          onChange={(e) => updateSection(section.id, { targetWordCount: parseInt(e.target.value) })}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Words"
                        />
                        <span className="text-xs text-gray-500">words</span>
                      </div>
                      <StatusBadge status={section.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'context' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Context Documents</h2>
              <p className="text-sm text-gray-600">
                Total context: {contextDocuments.reduce((sum, doc) => sum + doc.size, 0).toLocaleString()} characters
              </p>
            </div>

            <div className="space-y-4">
              {/* Add Document Form */}
              <div className="border border-gray-200 rounded p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Add Context Document</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    addContextDocument({
                      name: formData.get('name') as string,
                      content: formData.get('content') as string,
                      type: formData.get('type') as any,
                      size: (formData.get('content') as string).length
                    })
                    e.currentTarget.reset()
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      name="name"
                      type="text"
                      placeholder="Document name..."
                      className="border border-gray-300 rounded px-3 py-2"
                      required
                    />
                    <select
                      name="type"
                      className="border border-gray-300 rounded px-3 py-2"
                      required
                    >
                      <option value="brand_guidelines">Brand Guidelines</option>
                      <option value="research">Research</option>
                      <option value="competitor_analysis">Competitor Analysis</option>
                      <option value="previous_content">Previous Content</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <textarea
                    name="content"
                    placeholder="Paste document content here..."
                    className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </form>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {contextDocuments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No context documents added yet. Add documents to improve content generation.
                  </p>
                ) : (
                  contextDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-600">
                            {doc.type.replace('_', ' ')} • {doc.size.toLocaleString()} characters
                          </p>
                        </div>
                        <Button
                          onClick={() => setContextDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          variant="danger"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generation' && (
          <div className="space-y-6">
            {/* Generation Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Content Generation</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="gpt-5">GPT-5 (Best Quality)</option>
                    <option value="gpt-5-mini">GPT-5 Mini (Balanced)</option>
                  </select>
                  <Button
                    onClick={generateAllContent}
                    disabled={isGeneratingContent || plan.sections.length === 0}
                    variant="success"
                  >
                    {isGeneratingContent ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Generate All Content
                  </Button>
                </div>
              </div>

              {/* Section Generation */}
              <div className="space-y-4">
                {plan.sections.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No sections defined. Go to Planning tab to create sections.
                  </p>
                ) : (
                  plan.sections.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          {section.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {section.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {section.status === 'generating' && (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          )}
                          {section.status === 'failed' && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          {section.status === 'planned' && (
                            <Button
                              onClick={() => generateSectionContent(section.id)}
                              variant="primary"
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      <p className="text-xs text-gray-500">Target: {section.targetWordCount} words</p>
                      
                      {section.content && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700 line-clamp-3">{section.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {section.content.split(' ').length} words generated
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Export Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Content Preview</h2>
                <Button
                  onClick={exportContent}
                  disabled={!plan.sections.some(s => s.content)}
                  variant="primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Content
                </Button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {plan.sections.filter(s => s.content).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No content generated yet. Generate sections to see preview.
                </p>
              ) : (
                <div className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-6">{plan.title}</h1>
                  {plan.sections
                    .filter(section => section.content)
                    .map(section => (
                      <div key={section.id} className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
