'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface BreadcrumbItem {
  href: string
  children: React.ReactNode
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions,
  className 
}) => {
  return (
    <div className={cn(
      'mb-8',
      className
    )}>
      {breadcrumbs && (
        <nav className="mb-4" aria-label="Breadcrumb">
          {breadcrumbs}
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="ml-4 flex flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
