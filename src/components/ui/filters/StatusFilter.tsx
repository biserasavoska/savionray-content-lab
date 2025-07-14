import { useState } from 'react'

import { ContentStatus, IdeaStatus } from '@/types/content'
import { getStatusLabel } from '@/lib/utils/status-helpers'

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  statuses: (ContentStatus | IdeaStatus)[]
  placeholder?: string
  className?: string
}

export default function StatusFilter({ 
  value, 
  onChange, 
  statuses, 
  placeholder = 'Filter by status',
  className = '' 
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value ? getStatusLabel(value as ContentStatus | IdeaStatus) : placeholder}</span>
        <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            <button
              type="button"
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
            >
              All Statuses
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onChange(status)
                  setIsOpen(false)
                }}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 