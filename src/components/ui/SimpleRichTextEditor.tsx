'use client'

import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
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
  const [hasError, setHasError] = useState(false)

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

  if (hasError) {
    return (
      <div className={`border border-gray-300 rounded-md ${className}`}>
        <div className="p-4 min-h-[200px] flex items-center justify-center text-gray-500 bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-2">Editor failed to load</p>
            <p className="text-sm">Please refresh the page or try again</p>
          </div>
        </div>
      </div>
    )
  }

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
