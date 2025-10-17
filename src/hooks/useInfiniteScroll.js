import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook for implementing infinite scroll with cursor-based pagination
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - Infinite scroll state and functions
 */
const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialData = [],
    pageSize = 20,
    threshold = 0.8, // Trigger when 80% scrolled
    enabled = true,
    dependencies = []
  } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [cursor, setCursor] = useState(null)
  
  const observerRef = useRef(null)
  const loadingRef = useRef(false)

  // Reset state when dependencies change
  useEffect(() => {
    setData(initialData)
    setHasMore(true)
    setError(null)
    setCursor(null)
    loadingRef.current = false
  }, dependencies)

  // Fetch more data
  const fetchMore = useCallback(async (isInitial = false) => {
    if (loadingRef.current || (!hasMore && !isInitial)) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction({
        cursor: isInitial ? null : cursor,
        limit: pageSize,
        useCursor: true
      })

      if (result.error) {
        throw new Error(result.error.message || 'Error fetching data')
      }

      const newData = result.data || []
      
      setData(prevData => isInitial ? newData : [...prevData, ...newData])
      setHasMore(result.hasMore || false)
      setCursor(result.nextCursor || null)

    } catch (err) {
      console.error('Infinite scroll fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [fetchFunction, cursor, hasMore, pageSize])

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchMore(true)
    }
  }, [enabled, ...dependencies])

  // Intersection observer for scroll detection
  const lastElementRef = useCallback((node) => {
    if (loading) return
    
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && enabled) {
          fetchMore()
        }
      },
      { threshold }
    )

    if (node) {
      observerRef.current.observe(node)
    }
  }, [loading, hasMore, enabled, fetchMore, threshold])

  // Manual refresh
  const refresh = useCallback(() => {
    setData(initialData)
    setHasMore(true)
    setError(null)
    setCursor(null)
    loadingRef.current = false
    fetchMore(true)
  }, [fetchMore, initialData])

  // Load more manually (for button-based loading)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMore()
    }
  }, [fetchMore, loading, hasMore])

  return {
    data,
    loading,
    hasMore,
    error,
    lastElementRef,
    refresh,
    loadMore
  }
}

export default useInfiniteScroll