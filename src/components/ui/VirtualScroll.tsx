'use client'

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  enableSmoothScrolling?: boolean
  bufferSize?: number
}

export default function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  enableSmoothScrolling = true,
  bufferSize = 10
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  
  const { trackInteraction } = usePerformanceMonitor({
    componentName: 'VirtualScroll',
    trackRender: true,
    trackInteraction: true
  })

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  // Calculate total height
  const totalHeight = items.length * itemHeight

  // Handle scroll events with performance optimization
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement
    const newScrollTop = target.scrollTop
    
    setScrollTop(newScrollTop)
    setIsScrolling(true)
    onScroll?.(newScrollTop)
    
    // Track scroll performance
    trackInteraction('scroll')
    
    // Debounce scroll end detection
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [onScroll, trackInteraction])

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [handleScroll])

  // Generate visible items
  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    if (i >= 0 && i < items.length) {
      visibleItems.push({
        index: i,
        item: items[i],
        top: i * itemHeight
      })
    }
  }

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return
    
    let scrollTop: number
    
    switch (align) {
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2
        break
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight
        break
      default:
        scrollTop = index * itemHeight
    }
    
    containerRef.current.scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight))
  }, [itemHeight, containerHeight, totalHeight])

  // Scroll to specific item (useful for search)
  const scrollToItem = useCallback((predicate: (item: T) => boolean, align?: 'start' | 'center' | 'end') => {
    const index = items.findIndex(predicate)
    if (index !== -1) {
      scrollToIndex(index, align)
    }
  }, [items, scrollToIndex])

  // Expose scroll methods via ref
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      Object.assign(container, { scrollToIndex, scrollToItem })
    }
  }, [scrollToIndex, scrollToItem])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className} ${enableSmoothScrolling ? 'scroll-smooth' : ''}`}
      style={{ height: containerHeight }}
      role="grid"
      aria-rowcount={items.length}
      aria-label="Virtual scrollable list"
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ index, item, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
            role="gridcell"
            aria-rowindex={index + 1}
            className={`${isScrolling ? 'pointer-events-none' : ''}`}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading indicator during scrolling */}
        {isScrolling && (
          <div 
            className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs z-10"
            style={{ opacity: 0.8 }}
          >
            Scrolling...
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for easier usage with large datasets
export function useVirtualScroll<T>(
  items: T[],
  options: {
    itemHeight: number
    containerHeight: number
    overscan?: number
    bufferSize?: number
  }
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  
  const handleScroll = useCallback((scrollTop: number) => {
    const { itemHeight, containerHeight, overscan = 5 } = options
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    setVisibleRange({ start, end })
  }, [items.length, options])
  
  return {
    visibleRange,
    handleScroll,
    totalHeight: items.length * options.itemHeight
  }
}

// Performance-optimized list item wrapper
export function VirtualListItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div 
      className={`transform-gpu will-change-transform ${className}`}
      style={{ 
        containIntrinsicSize: 'auto',
        contentVisibility: 'auto'
      }}
    >
      {children}
    </div>
  )
}