import { useState } from 'react'
import { getMonthOptions } from '@/lib/utils/date-helpers'

interface MonthFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function MonthFilter({ 
  value, 
  onChange, 
  placeholder = 'Filter by month',
  className = '' 
}: MonthFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const monthOptions = getMonthOptions()

  const selectedLabel = monthOptions.find(option => option.value === value)?.label || placeholder

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
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
              All Months
            </button>
            {monthOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 