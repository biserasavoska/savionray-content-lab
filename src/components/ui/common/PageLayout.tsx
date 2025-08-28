'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className,
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-none'
  }
  
  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      className
    )}>
      <div className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8 py-8',
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </div>
  )
}

export default PageLayout
