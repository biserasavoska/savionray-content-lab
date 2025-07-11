'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface LazyLoadWrapperProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
}

export default function LazyLoadWrapper({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
}: LazyLoadWrapperProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasLoaded])

  return (
    <div ref={ref}>
      {isIntersecting || hasLoaded ? children : fallback}
    </div>
  )
}