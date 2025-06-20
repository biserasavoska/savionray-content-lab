'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface MediaUploadProps {
  contentDraftId: string
}

export default function MediaUpload({ contentDraftId }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setError(null)

    try {
      for (const file of acceptedFiles) {
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

        const data = await response.json()
        setUploadedFiles(prev => [...prev, data.url])
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [contentDraftId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <span className="text-red-600">Upload a file</span> or drag and drop
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {uploadedFiles.map((url, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`Uploaded media ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 