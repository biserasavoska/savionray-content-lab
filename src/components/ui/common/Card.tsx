import React from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, ...props }, ref) => {
    const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm'
    
    const variantClasses = {
      default: 'border-border',
      elevated: 'border-border shadow-md',
      outlined: 'border-border bg-transparent',
      ghost: 'border-transparent bg-transparent shadow-none'
    }
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8'
    }
    
    const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1' : ''
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6'
    }
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', spacingClasses[spacing], className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6'
    }
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', spacingClasses[spacing], className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-x-2',
      md: 'space-x-4',
      lg: 'space-x-6'
    }
    
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end', spacingClasses[spacing], className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
export default Card 