'use client'

import React from 'react'

export interface StatusBadgeProps {
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected' | 'archived' | 'pending' | 'active' | 'inactive' | 'completed' | 'in-progress' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  className,
  children 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium'
  
  const statusClasses = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-600',
    pending: 'bg-orange-100 text-orange-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  }
  
  const displayText = children || (status ? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') : 'Unknown')
  
  return (
    <span
      className={`${baseClasses} ${statusClasses[status] || statusClasses.draft} ${sizeClasses[size]} ${className || ''}`}
    >
      {displayText}
    </span>
  )
}

export default StatusBadge
