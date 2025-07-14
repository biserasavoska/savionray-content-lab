'use client'

import React from 'react'

import { ErrorType } from '@/lib/utils/error-handling'

interface ErrorDisplayProps {
  error: {
    type: ErrorType
    message: string
    code: string
    details?: Record<string, any>
  }
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
}

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return (
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return (
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 7-3 9-3 9s3 2 3 9a6 6 0 0012 0c0-7 3-9 3-9s-3-2-3-9zM8 8a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
          </svg>
        )
      case ErrorType.NOT_FOUND:
        return (
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case ErrorType.CONFLICT:
        return (
          <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case ErrorType.RATE_LIMIT:
        return (
          <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'bg-red-50 border-red-200 text-red-800'
      case ErrorType.NOT_FOUND:
        return 'bg-gray-50 border-gray-200 text-gray-800'
      case ErrorType.CONFLICT:
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case ErrorType.RATE_LIMIT:
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'Validation Error'
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required'
      case ErrorType.AUTHORIZATION:
        return 'Access Denied'
      case ErrorType.NOT_FOUND:
        return 'Not Found'
      case ErrorType.CONFLICT:
        return 'Conflict'
      case ErrorType.DATABASE:
        return 'Database Error'
      case ErrorType.EXTERNAL_API:
        return 'External Service Error'
      case ErrorType.RATE_LIMIT:
        return 'Rate Limit Exceeded'
      case ErrorType.INTERNAL:
      default:
        return 'Something went wrong'
    }
  }

  return (
    <div className={`rounded-md border p-4 ${getErrorColor()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {getErrorTitle()}
          </h3>
          <div className="mt-2 text-sm">
            <p>{error.message}</p>
          </div>
          
          {/* Error Details */}
          {showDetails && error.details && Object.keys(error.details).length > 0 && (
            <div className="mt-3">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">
                  Error Details
                </summary>
                <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simplified error display for common use cases
export function SimpleErrorDisplay({ 
  message, 
  onRetry, 
  className = '' 
}: { 
  message: string
  onRetry?: () => void
  className?: string 
}) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 