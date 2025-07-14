'use client'

import React from 'react'

import { cn } from '@/lib/utils/cn'

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  helpText?: string
  children: React.ReactNode
  className?: string
}

export default function FormField({ 
  label, 
  error, 
  required = false,
  helpText,
  children,
  className = ''
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export function Input({ 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}: InputProps) {
  const baseClasses = 'block w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  
  return (
    <input 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  showCharacterCount?: boolean
  maxLength?: number
}

export function Textarea({ 
  variant = 'default',
  size = 'md',
  showCharacterCount = false,
  maxLength,
  className = '',
  ...props 
}: TextareaProps) {
  const baseClasses = 'block w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical'
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  
  const currentLength = (props.value as string)?.length || 0
  
  return (
    <div className="space-y-1">
      <textarea 
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        maxLength={maxLength}
        {...props}
      />
      
      {showCharacterCount && maxLength && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentLength} characters</span>
          <span>{maxLength - currentLength} remaining</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
}

export function Select({ 
  options,
  variant = 'default',
  size = 'md',
  placeholder,
  className = '',
  ...props 
}: SelectProps) {
  const baseClasses = 'block w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  
  return (
    <select 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  variant?: 'default' | 'error' | 'success'
}

export function Checkbox({ 
  label,
  variant = 'default',
  className = '',
  ...props 
}: CheckboxProps) {
  const baseClasses = 'h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-gray-300 text-blue-600 focus:ring-blue-500',
    error: 'border-red-300 text-red-600 focus:ring-red-500',
    success: 'border-green-300 text-green-600 focus:ring-green-500'
  }
  
  return (
    <div className="flex items-center">
      <input 
        type="checkbox"
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      />
      
      {label && (
        <label className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      )}
    </div>
  )
}

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  variant?: 'default' | 'error' | 'success'
  className?: string
}

export function RadioGroup({ 
  name,
  options,
  value,
  onChange,
  variant = 'default',
  className = ''
}: RadioGroupProps) {
  const baseClasses = 'h-4 w-4 border focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-gray-300 text-blue-600 focus:ring-blue-500',
    error: 'border-red-300 text-red-600 focus:ring-red-500',
    success: 'border-green-300 text-green-600 focus:ring-green-500'
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input 
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            className={cn(
              baseClasses,
              variantClasses[variant]
            )}
          />
          
          <label className="ml-2 block text-sm text-gray-900">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
} 