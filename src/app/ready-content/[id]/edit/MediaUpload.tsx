'use client'

import { useState, useEffect } from 'react'

import type { Media } from '@/types/content'
import Card from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface MediaUploadProps {
  contentId: string
}

export default function MediaUpload({ contentId }: MediaUploadProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [contentId])

  const fetchMedia = async () => {
    try {
      // Since we're working with ContentDrafts, we need to fetch media from the Media table
      // We'll need to create a media API endpoint or fetch through the draft data
      // For now, let's skip this and focus on the main issue
      console.log('Media fetching not yet implemented for drafts')
    } catch (error) {
      console.error('Error fetching media:', error)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    try {
      // Upload files one by one using the existing upload API
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('contentDraftId', contentId)

        const response = await fetch(`/api/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      // Refresh media list
      fetchMedia()
      alert('Files uploaded successfully!')
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      // Since we don't have a media API endpoint, we'll need to create one
      // For now, let's just remove from local state
      console.log('Media deletion not yet implemented for drafts')
      setMedia(prev => prev.filter(m => m.id !== mediaId))
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Error deleting file. Please try again.')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    if (contentType === 'application/pdf') {
      return (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
    return (
      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        variant={dragActive ? 'elevated' : 'outlined'}
        className={`transition-all duration-200 ${
          dragActive ? 'border-red-400 bg-red-50' : 'hover:border-gray-400'
        }`}
      >
        <div
          className="p-8 text-center cursor-pointer"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card variant="outlined" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <span className="text-sm text-gray-600">Uploading files...</span>
          </div>
        </Card>
      )}

      {/* Media List */}
      {media.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Attached Files</h3>
            <Badge variant="info">{media.length} file{media.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="space-y-3">
            {media.map((file) => (
              <Card key={file.id} variant="outlined" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileTypeIcon(file.contentType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        <Badge variant="default" size="sm">
                          {file.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMedia(file.id)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 