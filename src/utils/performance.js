/**
 * Performance monitoring and optimization utilities
 */

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} interval - Interval in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, interval) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= interval) {
      lastCall = now
      return func.apply(null, args)
    }
  }
}

/**
 * Measure and log performance of a function
 * @param {Function} func - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {Function} - Wrapped function with performance measurement
 */
export const measurePerformance = (func, label) => {
  return async (...args) => {
    const startTime = performance.now()
    
    try {
      const result = await func.apply(null, args)
      const endTime = performance.now()
      
      console.log(`Performance [${label}]: ${(endTime - startTime).toFixed(2)}ms`)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      console.log(`Performance [${label}] (with error): ${(endTime - startTime).toFixed(2)}ms`)
      throw error
    }
  }
}

/**
 * Create a memoized version of a function
 * @param {Function} func - Function to memoize
 * @param {Function} keyGenerator - Function to generate cache key
 * @returns {Function} - Memoized function
 */
export const memoize = (func, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map()
  
  return (...args) => {
    const key = keyGenerator(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func.apply(null, args)
    cache.set(key, result)
    
    // Clean up cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

/**
 * Batch multiple async operations to reduce API calls
 * @param {Function} operation - Async operation to batch
 * @param {number} batchSize - Maximum batch size
 * @param {number} delay - Delay between batches in milliseconds
 * @returns {Function} - Batched operation function
 */
export const batchOperations = (operation, batchSize = 10, delay = 100) => {
  let queue = []
  let processing = false

  const processQueue = async () => {
    if (processing || queue.length === 0) return
    
    processing = true
    
    while (queue.length > 0) {
      const batch = queue.splice(0, batchSize)
      const promises = batch.map(({ args, resolve, reject }) => 
        operation(...args).then(resolve).catch(reject)
      )
      
      await Promise.allSettled(promises)
      
      if (queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    processing = false
  }

  return (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject })
      processQueue()
    })
  }
}

/**
 * Monitor Core Web Vitals
 */
export const monitorWebVitals = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  const observeLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      console.log('LCP:', lastEntry.startTime)
      
      // LCP should be less than 2.5s for good performance
      if (lastEntry.startTime > 2500) {
        console.warn('LCP is slower than recommended (2.5s)')
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }

  // First Input Delay (FID) - approximated with First Contentful Paint
  const observeFCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0]
      
      console.log('FCP:', firstEntry.startTime)
      
      // FCP should be less than 1.8s for good performance
      if (firstEntry.startTime > 1800) {
        console.warn('FCP is slower than recommended (1.8s)')
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
  }

  // Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    let clsValue = 0
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      
      console.log('CLS:', clsValue)
      
      // CLS should be less than 0.1 for good performance
      if (clsValue > 0.1) {
        console.warn('CLS is higher than recommended (0.1)')
      }
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
  }

  // Initialize observers
  try {
    observeLCP()
    observeFCP()
    observeCLS()
  } catch (error) {
    console.warn('Performance monitoring not supported:', error)
  }
}

/**
 * Preload critical resources
 * @param {string[]} urls - URLs to preload
 * @param {string} as - Resource type (script, style, image, etc.)
 */
export const preloadResources = (urls, as = 'fetch') => {
  if (typeof document === 'undefined') return

  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = as
    
    if (as === 'fetch') {
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
  })
}

/**
 * Lazy load a module with error handling
 * @param {Function} importFunction - Dynamic import function
 * @param {number} retries - Number of retry attempts
 * @returns {Promise} - Module promise
 */
export const lazyLoadModule = async (importFunction, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFunction()
    } catch (error) {
      console.warn(`Lazy load attempt ${i + 1} failed:`, error)
      
      if (i === retries - 1) {
        throw new Error(`Failed to load module after ${retries} attempts`)
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

/**
 * Check if user is on a slow connection
 * @returns {boolean} - True if connection is slow
 */
export const isSlowConnection = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return false
  }

  const connection = navigator.connection
  
  // Consider 2G or slow-2g as slow connections
  return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'
}

/**
 * Optimize images based on connection speed
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const optimizeImageUrl = (imageUrl, options = {}) => {
  const { width, height, quality = 80, format = 'auto' } = options
  
  // If on slow connection, reduce quality and size
  if (isSlowConnection()) {
    const slowOptions = {
      width: width ? Math.floor(width * 0.7) : undefined,
      height: height ? Math.floor(height * 0.7) : undefined,
      quality: Math.min(quality, 60),
      format: 'webp'
    }
    
    return buildOptimizedUrl(imageUrl, slowOptions)
  }
  
  return buildOptimizedUrl(imageUrl, { width, height, quality, format })
}

/**
 * Build optimized image URL (placeholder implementation)
 * In a real app, this would integrate with your image optimization service
 * @param {string} url - Original URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized URL
 */
const buildOptimizedUrl = (url, options) => {
  // This is a placeholder - in production you'd integrate with services like:
  // - Cloudinary
  // - ImageKit
  // - Supabase Image Transformations
  // - Custom image optimization service
  
  const params = new URLSearchParams()
  
  if (options.width) params.set('w', options.width)
  if (options.height) params.set('h', options.height)
  if (options.quality) params.set('q', options.quality)
  if (options.format && options.format !== 'auto') params.set('f', options.format)
  
  const separator = url.includes('?') ? '&' : '?'
  return params.toString() ? `${url}${separator}${params.toString()}` : url
}