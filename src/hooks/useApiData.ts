'use client'

import { useState, useEffect, useCallback } from 'react'

import { logger } from '@/lib/utils/logger'

// ============================================================================
// API DATA HOOK
// ============================================================================

export interface ApiDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface UseApiDataOptions {
  immediate?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  retryCount?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApiData<T>(
  url: string | null,
  options: UseApiDataOptions = {}
): [
  ApiDataState<T>,
  {
    refetch: () => Promise<void>
    setData: (data: T) => void
    clearError: () => void
    reset: () => void
  }
] {
  const {
    immediate = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const [retryAttempts, setRetryAttempts] = useState(0)

  // ============================================================================
  // FETCH FUNCTION
  // ============================================================================

  const fetchData = useCallback(async (): Promise<void> => {
    if (!url) return

    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const endTimer = logger.time(`API Request: ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      endTimer()
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })

      setRetryAttempts(0)
      onSuccess?.(data)
      
      logger.info(`API Request successful: ${url}`, { data })

    } catch (error) {
      endTimer()
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      logger.error(`API Request failed: ${url}`, error as Error, { 
        retryAttempts,
        retryCount 
      })

      // Retry logic
      if (retryAttempts < retryCount) {
        setRetryAttempts(prev => prev + 1)
        
        setTimeout(() => {
          fetchData()
        }, retryDelay * (retryAttempts + 1))
        
        return
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      onError?.(error as Error)
    }
  }, [url, retryAttempts, retryCount, retryDelay, onSuccess, onError])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (immediate && url) {
      fetchData()
    }
  }, [url, immediate, fetchData])

  useEffect(() => {
    if (refetchOnMount && url) {
      fetchData()
    }
  }, [refetchOnMount, url, fetchData])

  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, fetchData])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date()
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
    setRetryAttempts(0)
  }, [])

  return [
    state,
    { refetch, setData, clearError, reset }
  ]
}

// ============================================================================
// PAGINATED DATA HOOK
// ============================================================================

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface PaginatedApiDataState<T> extends ApiDataState<T[]> {
  pagination: PaginationState
}

export function usePaginatedData<T>(
  baseUrl: string,
  options: UseApiDataOptions & {
    initialPage?: number
    initialLimit?: number
  } = {}
): [
  PaginatedApiDataState<T>,
  {
    refetch: () => Promise<void>
    loadMore: () => Promise<void>
    goToPage: (page: number) => Promise<void>
    setLimit: (limit: number) => void
    reset: () => void
  }
] {
  const {
    initialPage = 1,
    initialLimit = 10,
    ...apiOptions
  } = options

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    hasMore: false
  })

  const [allData, setAllData] = useState<T[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const url = `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}`

  const [state, { refetch: baseRefetch, reset: baseReset }] = useApiData<{
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(url, {
    ...apiOptions,
    onSuccess: (response) => {
      const { data, pagination: paginationData } = response
      
      setPagination(prev => ({
        ...prev,
        page: paginationData.page,
        total: paginationData.total,
        hasMore: paginationData.page < paginationData.totalPages
      }))

      // For first page, replace data. For subsequent pages, append data
      if (paginationData.page === 1) {
        setAllData(data)
      } else {
        setAllData(prev => [...prev, ...data])
      }
    }
  })

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    
    try {
      const nextPageUrl = `${baseUrl}?page=${pagination.page + 1}&limit=${pagination.limit}`
      const response = await fetch(nextPageUrl)
      const result = await response.json()
      
      const { data, pagination: paginationData } = result
      
      setAllData(prev => [...prev, ...data])
      setPagination(prev => ({
        ...prev,
        page: paginationData.page,
        total: paginationData.total,
        hasMore: paginationData.page < paginationData.totalPages
      }))
    } catch (error) {
      logger.error('Failed to load more data', error as Error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [baseUrl, pagination, isLoadingMore])

  const goToPage = useCallback(async (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    setAllData([])
    await baseRefetch()
  }, [baseRefetch])

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
    setAllData([])
  }, [])

  const reset = useCallback(() => {
    baseReset()
    setAllData([])
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      hasMore: false
    })
    setIsLoadingMore(false)
  }, [baseReset, initialPage, initialLimit])

  const paginatedState: PaginatedApiDataState<T> = {
    ...state,
    data: allData,
    loading: state.loading || isLoadingMore,
    pagination
  }

  return [
    paginatedState,
    { refetch: baseRefetch, loadMore, goToPage, setLimit, reset }
  ]
} 