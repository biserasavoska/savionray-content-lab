'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-md p-4 min-h-[200px] flex items-center justify-center text-gray-500 bg-gray-50">Loading editor...</div>
})

// Import CSS only on client side
if (typeof window !== 'undefined') {
  import('react-quill/dist/quill.snow.css')
}

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

  return (
    <div className={`${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ql-editor {
            color: #1f2937 !important;
            font-size: 14px;
            line-height: 1.5;
          }
          .ql-editor.ql-blank::before {
            color: #9ca3af !important;
            font-style: normal;
          }
          .ql-toolbar {
            border-top: 1px solid #d1d5db;
            border-left: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
          }
          .ql-container {
            border-bottom: 1px solid #d1d5db;
            border-left: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
          }
        `
      }} />
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
