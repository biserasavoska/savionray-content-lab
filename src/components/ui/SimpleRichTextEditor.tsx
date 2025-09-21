'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md">
      <div className="p-4 min-h-[200px] flex items-center justify-center text-gray-500 bg-gray-50">
        Loading editor...
      </div>
    </div>
  )
})

import 'react-quill/dist/quill.snow.css'

interface SimpleRichTextEditorProps {
  content: string
  onContentChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  content,
  onContentChange,
  placeholder = 'Start writing...',
  disabled = false,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'blockquote', 'code-block',
    'link', 'image', 'color', 'background'
  ]

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-md ${className}`}>
        <div className="p-4 min-h-[200px] flex items-center justify-center text-gray-500 bg-gray-50">
          Loading editor...
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onContentChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={modules}
        formats={formats}
        style={{
          minHeight: '200px',
          backgroundColor: 'white'
        }}
      />
    </div>
  )
}

export default SimpleRichTextEditor
