import React from 'react'
import { cn } from '@/lib/utils/cn'

// Page Layout Wrapper
interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large' | 'full'
  children: React.ReactNode
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, size = 'medium', children, ...props }, ref) => {
    const sizeClasses = {
      small: 'max-w-3xl mx-auto px-4 sm:px-6',
      medium: 'max-w-4xl mx-auto px-4 sm:px-6',
      large: 'max-w-6xl mx-auto px-4 sm:px-6',
      full: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-gray-50 py-6',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageLayout.displayName = 'PageLayout'

// Page Header
interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, breadcrumbs, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-6', className)}
        {...props}
      >
        {breadcrumbs && (
          <div className="mb-4">
            {breadcrumbs}
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 text-base">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = 'PageHeader'

// Page Content
interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageContent.displayName = 'PageContent'

// Page Section
interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children: React.ReactNode
}

const PageSection = React.forwardRef<HTMLDivElement, PageSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}
        {...props}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    )
  }
)
PageSection.displayName = 'PageSection'

// Breadcrumb Item
interface BreadcrumbItemProps {
  href?: string
  children: React.ReactNode
  isActive?: boolean
}

const BreadcrumbItem = ({ href, children, isActive = false }: BreadcrumbItemProps) => {
  if (isActive) {
    return (
      <span className="text-gray-500 text-sm">
        {children}
      </span>
    )
  }
  
  if (href) {
    return (
      <a
        href={href}
        className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
      >
        {children}
      </a>
    )
  }
  
  return (
    <span className="text-gray-600 text-sm">
      {children}
    </span>
  )
}

// Breadcrumbs
interface BreadcrumbsProps {
  items: BreadcrumbItemProps[]
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem {...item} />
          {index < items.length - 1 && (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export {
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  Breadcrumbs,
  BreadcrumbItem
}
