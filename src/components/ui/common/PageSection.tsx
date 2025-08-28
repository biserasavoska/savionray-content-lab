'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface PageSectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  contentClassName?: string
}

const PageSection: React.FC<PageSectionProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className,
  contentClassName 
}) => {
  return (
    <section className={cn(
      'bg-white shadow-sm rounded-lg border border-gray-200',
      className
    )}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-medium text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
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
      )}
      
      <div className={cn(
        'px-6 py-4',
        contentClassName
      )}>
        {children}
      </div>
    </section>
  )
}

export default PageSection
