'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import MediaUpload from './MediaUpload'

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
})

interface Creator {
  name: string | null
  email: string | null
}

interface Feedback {
  id: string
  comment: string
  createdAt: Date | string
  createdBy: Creator
}

interface ContentEditorProps {
  ideaId: string
  contentDraftId: string
  initialContent: string
  feedbacks: Feedback[]
}

export default function ContentEditor({
  ideaId,
  contentDraftId,
  initialContent,
  feedbacks,
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [editor, setEditor] = useState<any>(null)
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/ideas/${ideaId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (url: string) => {
    if (editor) {
      const range = editor.getSelection(true)
      editor.insertEmbed(range.index, 'image', url)
    }
  }

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4 mb-4">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ) : (
        <>
          <div className="prose prose-sm max-w-none">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={(value, delta, source, editor) => {
                setContent(value)
                setEditor(editor)
              }}
              modules={modules}
              className="h-96"
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Upload Images
            </h3>
            <MediaUpload onUpload={handleImageUpload} contentDraftId={contentDraftId} />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${isSaving
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      {feedbacks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Feedback History</h3>
          <div className="mt-4 space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {feedback.createdBy.name || feedback.createdBy.email}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 