'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ErrorDisplayProps {
  title?: string
  message: string
  variant?: 'default' | 'destructive' | 'warning'
  className?: string
  onRetry?: () => void
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = 'Error',
  message, 
  variant = 'default',
  className,
  onRetry
}) => {
  const variantClasses = {
    default: 'bg-red-50 border-red-200 text-red-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }
  
  const iconClasses = {
    default: 'text-red-400',
    destructive: 'text-red-400',
    warning: 'text-yellow-400'
  }
  
  return (
    <div className={cn(
      'rounded-md border p-4',
      variantClasses[variant],
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={cn('h-5 w-5', iconClasses[variant])}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  variant === 'warning' 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                )}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay
