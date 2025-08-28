'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface PageContentProps {
  children: React.ReactNode
  className?: string
}

const PageContent: React.FC<PageContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <main className={cn(
      'flex-1',
      className
    )}>
      {children}
    </main>
  )
}

export default PageContent
