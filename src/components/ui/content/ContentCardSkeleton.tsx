'use client'

import React from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'

interface ContentCardSkeletonProps {
  className?: string
}

const ContentCardSkeleton: React.FC<ContentCardSkeletonProps> = ({ className }) => {
  return (
    <Card className={`h-full flex flex-col animate-pulse ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            {/* Description skeleton */}
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Status badge skeleton */}
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            {/* Content type badge skeleton */}
            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Content skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        <div className="space-y-2">
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-1">
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          {/* Priority badge skeleton */}
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ContentCardSkeleton
