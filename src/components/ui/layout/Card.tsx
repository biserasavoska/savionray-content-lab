'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Card({ 
  variant = 'default', 
  padding = 'md',
  className = '',
  children,
  ...props 
}: CardProps) {
  const baseClasses = 'rounded-lg'
  
  const variantClasses = {
    default: 'bg-white shadow-sm border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-200',
    bordered: 'bg-white border-2 border-gray-200',
    flat: 'bg-white'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div 
      className={cn('flex items-center justify-between border-b border-gray-200 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// CARD TITLE COMPONENT
// ============================================================================

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({ 
  as: Component = 'h3', 
  className = '', 
  children, 
  ...props 
}: CardTitleProps) {
  return (
    <Component 
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// CARD CONTENT COMPONENT
// ============================================================================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div 
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div 
      className={cn('flex items-center justify-between border-t border-gray-200 pt-4 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// CARD GRID COMPONENT
// ============================================================================

export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

export function CardGrid({ 
  columns = 1, 
  gap = 'md',
  className = '', 
  children, 
  ...props 
}: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }
  
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8'
  }
  
  return (
    <div 
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 