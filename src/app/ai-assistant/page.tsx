'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import ChatGPTSidebar from '@/components/ai-assistant/ChatGPTSidebar'
import ChatGPTChatArea from '@/components/ai-assistant/ChatGPTChatArea'
import KnowledgeBaseSidebar from '@/components/ai-assistant/KnowledgeBaseSidebar'

export default function AIAssistantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null)
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-screen bg-white">
      <ChatGPTSidebar 
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onToggleKnowledgeBase={() => setShowKnowledgeBase(!showKnowledgeBase)}
      />
      {showKnowledgeBase && (
        <KnowledgeBaseSidebar
          selectedKnowledgeBase={selectedKnowledgeBase}
          onSelectKnowledgeBase={setSelectedKnowledgeBase}
        />
      )}
      <ChatGPTChatArea 
        conversationId={selectedConversation}
        knowledgeBaseId={selectedKnowledgeBase}
      />
    </div>
  )
}
