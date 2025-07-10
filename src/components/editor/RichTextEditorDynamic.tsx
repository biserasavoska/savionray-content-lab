'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamic import with loading state for better performance
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => (
    <div className="border border-gray-300 rounded-md p-4 min-h-[200px] flex items-center justify-center bg-gray-50">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-gray-600">Loading editor...</span>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for editor to avoid hydration issues
})

interface RichTextEditorDynamicProps {
  content: string
  onChange: (content: string) => void
  maxLength?: number
  placeholder?: string
}

export default function RichTextEditorDynamic(props: RichTextEditorDynamicProps) {
  return (
    <div className="w-full">
      <RichTextEditor {...props} />
    </div>
  )
}