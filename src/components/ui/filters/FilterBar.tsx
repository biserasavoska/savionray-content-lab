import { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export default function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-white border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
} 