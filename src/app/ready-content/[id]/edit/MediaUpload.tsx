'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface MediaUploadProps {
  onUpload: (url: string) => void
  contentDraftId: string
}

export default function MediaUpload({ onUpload, contentDraftId }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    setError('')

    try {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contentDraftId', contentDraftId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const media = await response.json()
      onUpload(media.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, contentDraftId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-gray-600">
            <svg
              className="animate-spin h-5 w-5 mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the image here</p>
        ) : (
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Drag and drop an image, or click to select</p>
            <p className="text-sm mt-1">Max size: 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 