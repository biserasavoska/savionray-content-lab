import { useState, useEffect, useRef, useCallback } from 'react'

interface QueuedOperation {
  id: string
  type: 'content-change' | 'new-comment' | 'resolve-comment'
  data: any
  timestamp: number
  retryCount: number
}

interface UseOfflineQueueOptions {
  maxRetries?: number
  retryDelay?: number
  maxQueueSize?: number
}

export function useOfflineQueue(options: UseOfflineQueueOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 5000,
    maxQueueSize = 100
  } = options

  const [isOnline, setIsOnline] = useState(true)
  const [queue, setQueue] = useState<QueuedOperation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🟢 Back online - processing queued operations')
      processQueue()
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('🔴 Gone offline - operations will be queued')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Process queue when online
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0 || !isOnline) {
      return
    }

    processingRef.current = true
    setIsProcessing(true)

    try {
      const operationsToProcess = [...queue]
      const successfulOperations: string[] = []
      const failedOperations: QueuedOperation[] = []

      for (const operation of operationsToProcess) {
        try {
          // Emit the operation to the socket
          await emitOperation(operation)
          successfulOperations.push(operation.id)
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error)
          
          if (operation.retryCount < maxRetries) {
            failedOperations.push({
              ...operation,
              retryCount: operation.retryCount + 1
            })
          } else {
            console.error(`Operation ${operation.id} exceeded max retries`)
          }
        }
      }

      // Update queue
      setQueue(prev => {
        const newQueue = prev.filter(op => 
          !successfulOperations.includes(op.id) && 
          !failedOperations.some(failed => failed.id === op.id)
        )
        
        // Add failed operations back to queue for retry
        return [...newQueue, ...failedOperations]
      })

      // Schedule retry for failed operations
      if (failedOperations.length > 0) {
        retryTimeoutRef.current = setTimeout(() => {
          processQueue()
        }, retryDelay)
      }

    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }, [queue, isOnline, maxRetries, retryDelay])

  // Emit operation to socket (this will be provided by the component)
  const emitOperation = async (operation: QueuedOperation): Promise<void> => {
    return new Promise((resolve, reject) => {
      // This will be set by the component using the hook
      if (window.socketEmitter) {
        window.socketEmitter(operation, resolve, reject)
      } else {
        reject(new Error('Socket emitter not available'))
      }
    })
  }

  // Add operation to queue
  const addToQueue = useCallback((type: QueuedOperation['type'], data: any) => {
    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    setQueue(prev => {
      const newQueue = [...prev, operation]
      
      // Limit queue size
      if (newQueue.length > maxQueueSize) {
        return newQueue.slice(-maxQueueSize)
      }
      
      return newQueue
    })

    // Process immediately if online
    if (isOnline) {
      processQueue()
    }

    return operation.id
  }, [isOnline, processQueue, maxQueueSize])

  // Remove operation from queue
  const removeFromQueue = useCallback((operationId: string) => {
    setQueue(prev => prev.filter(op => op.id !== operationId))
  }, [])

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([])
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const pending = queue.filter(op => op.retryCount === 0).length
    const retrying = queue.filter(op => op.retryCount > 0).length
    const total = queue.length

    return {
      pending,
      retrying,
      total,
      isOnline,
      isProcessing
    }
  }, [queue, isOnline, isProcessing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    isOnline,
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    getQueueStats,
    processQueue
  }
}

// Extend Window interface for socket emitter
declare global {
  interface Window {
    socketEmitter?: (
      operation: any, 
      resolve: () => void, 
      reject: (error: Error) => void
    ) => void
  }
} 