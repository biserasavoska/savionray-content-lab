'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface BreadcrumbItem {
  href: string
  children: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  className 
}) => {
  return (
    <ol className={cn(
      'flex items-center space-x-2 text-sm text-gray-500',
      className
    )}>
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="mx-2 h-4 w-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">
              {item.children}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.children}
            </Link>
          )}
        </li>
      ))}
    </ol>
  )
}

export default Breadcrumbs
