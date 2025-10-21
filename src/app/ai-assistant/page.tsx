'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import ChatGPTSidebar from '@/components/ai-assistant/ChatGPTSidebar'
import ChatGPTChatArea from '@/components/ai-assistant/ChatGPTChatArea'

export default function AIAssistantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

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
      />
      <ChatGPTChatArea 
        conversationId={selectedConversation}
      />
    </div>
  )
}
