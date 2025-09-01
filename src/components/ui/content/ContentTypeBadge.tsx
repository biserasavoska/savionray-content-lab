'use client'

import React from 'react'
import Badge from '@/components/ui/common/Badge'
import { 
  FileText, 
  Globe, 
  Share2, 
  Video, 
  Headphones, 
  Mail,
  Image,
  FileVideo,
  Mic,
  Rss
} from 'lucide-react'

export interface ContentTypeBadgeProps {
  contentType: 'article' | 'blog' | 'social' | 'video' | 'podcast' | 'newsletter' | 'image' | 'document' | 'audio' | 'rss'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const ContentTypeBadge: React.FC<ContentTypeBadgeProps> = ({
  contentType,
  size = 'sm',
  showIcon = true,
  className,
}) => {
  const contentTypeConfig = {
    article: {
      label: 'Article',
      colors: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: FileText,
    },
    blog: {
      label: 'Blog Post',
      colors: 'bg-green-100 text-green-800 border-green-200',
      icon: Globe,
    },
    social: {
      label: 'Social Media',
      colors: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Share2,
    },
    video: {
      label: 'Video',
      colors: 'bg-red-100 text-red-800 border-red-200',
      icon: Video,
    },
    podcast: {
      label: 'Podcast',
      colors: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Headphones,
    },
    newsletter: {
      label: 'Newsletter',
      colors: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: Mail,
    },
    image: {
      label: 'Image',
      colors: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Image,
    },
    document: {
      label: 'Document',
      colors: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FileText,
    },
    audio: {
      label: 'Audio',
      colors: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Mic,
    },
    rss: {
      label: 'RSS Feed',
      colors: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Rss,
    },
  }

  const config = contentTypeConfig[contentType]
  const IconComponent = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses[size]} ${config.colors} ${className || ''}`}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} mr-1`} />
      )}
      {config.label}
    </Badge>
  )
}

export default ContentTypeBadge
