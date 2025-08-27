import React from 'react'

import { cn } from '@/lib/utils/cn'

// Base FormField wrapper
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, helperText, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

// Input component
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200'
    
    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
    }
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }
    
    return (
      <input
        ref={ref}
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
)
Input.displayName = 'Input'

// Select component
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  options: SelectOption[]
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, variant = 'default', size = 'md', onChange, ...props }, ref) => {
    const baseClasses = 'w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200'
    
    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
    }
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }
    
    return (
      <select
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...props}
      >
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
)
Select.displayName = 'Select'

// Textarea component
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-vertical'
    
    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
    }
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }
    
    return (
      <textarea
        ref={ref}
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
)
Textarea.displayName = 'Textarea'

// Checkbox component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200'
    
    const variantClasses = {
      default: 'border-gray-300 focus:ring-blue-500',
      error: 'border-red-300 focus:ring-red-500',
      success: 'border-green-300 focus:ring-green-500'
    }
    
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
    
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700">{label}</label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

// Radio component
interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200'
    
    const variantClasses = {
      default: 'border-gray-300 focus:ring-blue-500',
      error: 'border-red-300 focus:ring-red-500',
      success: 'border-green-300 focus:ring-green-500'
    }
    
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
    
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={ref}
          type="radio"
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700">{label}</label>
        )}
      </div>
    )
  }
)
Radio.displayName = 'Radio'

// Switch component
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'sr-only'
    
    const switchSizes = {
      sm: 'w-8 h-4',
      md: 'w-11 h-6',
      lg: 'w-14 h-7'
    }
    
    const switchVariants = {
      default: 'bg-gray-200 peer-checked:bg-blue-600',
      error: 'bg-gray-200 peer-checked:bg-red-600',
      success: 'bg-gray-200 peer-checked:bg-green-600'
    }
    
    const switchDotSizes = {
      sm: 'w-3 h-3',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }
    
    return (
      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={cn(baseClasses, className)}
            {...props}
          />
          <div className={cn(
            'relative bg-gray-200 rounded-full transition-colors duration-200 ease-in-out',
            switchSizes[size],
            switchVariants[variant]
          )}>
            <div className={cn(
              'absolute left-0.5 top-0.5 bg-white rounded-full transition-transform duration-200 ease-in-out',
              switchDotSizes[size],
              'peer-checked:translate-x-full'
            )} />
          </div>
        </label>
        {label && (
          <label className="text-sm text-gray-700">{label}</label>
        )}
      </div>
    )
  }
)
Switch.displayName = 'Switch'

export {
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Switch
} 