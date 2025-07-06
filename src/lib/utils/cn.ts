import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * UTILITY: CLASS NAME MERGER
 * 
 * Combines clsx and tailwind-merge for optimal class name handling.
 * This utility ensures that Tailwind classes are properly merged and deduplicated.
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * cn('bg-red-500', 'bg-blue-500') // Returns 'bg-blue-500'
 * cn('p-4', className) // Merges with existing className
 * cn('text-sm', isActive && 'text-blue-500') // Conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 