import React from 'react'
import { cn } from '@/lib/utils/cn'

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  variant?: 'default' | 'rounded' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, variant = 'default', size = 'md', ...props }, ref) => {
    // Normalize status to lowercase for consistent mapping
    const normalizedStatus = status.toLowerCase()
    
    // Status color mapping
    const getStatusColors = (status: string) => {
      switch (status) {
        case 'approved':
        case 'success':
        case 'completed':
        case 'published':
          return 'bg-green-100 text-green-800 border-green-200'
        
        case 'pending':
        case 'draft':
        case 'waiting':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        
        case 'rejected':
        case 'failed':
        case 'error':
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200'
        
        case 'in_progress':
        case 'processing':
        case 'active':
          return 'bg-blue-100 text-blue-800 border-blue-200'
        
        case 'scheduled':
        case 'planned':
          return 'bg-purple-100 text-purple-800 border-purple-200'
        
        case 'archived':
        case 'inactive':
        case 'disabled':
          return 'bg-gray-100 text-gray-800 border-gray-200'
        
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    }
    
    // Variant classes
    const variantClasses = {
      default: 'border',
      rounded: 'border rounded-full',
      outlined: 'border-2 bg-transparent'
    }
    
    const statusColors = getStatusColors(normalizedStatus)
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium transition-colors duration-200',
          statusColors,
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {status}
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

export default StatusBadge
