/**
 * Client-side rate limiting utilities to prevent abuse and improve security
 */

/**
 * Rate limiter class for managing request limits
 */
class RateLimiter {
  constructor(options = {}) {
    this.limits = new Map()
    this.defaultOptions = {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (identifier) => identifier,
      onLimitReached: null,
      ...options
    }
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - Unique identifier for the request source
   * @param {Object} options - Override options for this check
   * @returns {Object} - Result with allowed status and remaining info
   */
  checkLimit(identifier, options = {}) {
    const config = { ...this.defaultOptions, ...options }
    const key = config.keyGenerator(identifier)
    const now = Date.now()

    // Get or create limit data for this key
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        requests: [],
        windowStart: now
      })
    }

    const limitData = this.limits.get(key)

    // Clean old requests outside the window
    const windowStart = now - config.windowMs
    limitData.requests = limitData.requests.filter(timestamp => timestamp > windowStart)

    // Check if limit is exceeded
    const currentRequests = limitData.requests.length
    const allowed = currentRequests < config.maxRequests

    if (allowed) {
      // Add current request timestamp
      limitData.requests.push(now)
    } else if (config.onLimitReached) {
      config.onLimitReached(key, currentRequests, config.maxRequests)
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - currentRequests - (allowed ? 1 : 0)),
      resetTime: Math.min(...limitData.requests) + config.windowMs,
      totalRequests: currentRequests + (allowed ? 1 : 0),
      maxRequests: config.maxRequests
    }
  }

  /**
   * Reset limits for a specific identifier
   * @param {string} identifier - Identifier to reset
   */
  reset(identifier) {
    const key = this.defaultOptions.keyGenerator(identifier)
    this.limits.delete(key)
  }

  /**
   * Clear all limits
   */
  clearAll() {
    this.limits.clear()
  }

  /**
   * Get current status for an identifier
   * @param {string} identifier - Identifier to check
   * @returns {Object|null} - Current status or null if no data
   */
  getStatus(identifier) {
    const key = this.defaultOptions.keyGenerator(identifier)
    const limitData = this.limits.get(key)
    
    if (!limitData) {
      return null
    }

    const now = Date.now()
    const windowStart = now - this.defaultOptions.windowMs
    const activeRequests = limitData.requests.filter(timestamp => timestamp > windowStart)

    return {
      requests: activeRequests.length,
      maxRequests: this.defaultOptions.maxRequests,
      remaining: Math.max(0, this.defaultOptions.maxRequests - activeRequests.length),
      resetTime: Math.min(...activeRequests) + this.defaultOptions.windowMs
    }
  }
}

// Global rate limiters for different types of operations
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier) => `auth:${identifier}`,
  onLimitReached: (key, current, max) => {
    console.warn(`Authentication rate limit exceeded for ${key}: ${current}/${max}`)
  }
})

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (identifier) => `api:${identifier}`,
  onLimitReached: (key, current, max) => {
    console.warn(`API rate limit exceeded for ${key}: ${current}/${max}`)
  }
})

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyGenerator: (identifier) => `upload:${identifier}`,
  onLimitReached: (key, current, max) => {
    console.warn(`Upload rate limit exceeded for ${key}: ${current}/${max}`)
  }
})

export const searchRateLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (identifier) => `search:${identifier}`,
  onLimitReached: (key, current, max) => {
    console.warn(`Search rate limit exceeded for ${key}: ${current}/${max}`)
  }
})

/**
 * Create a rate-limited version of a function
 * @param {Function} func - Function to rate limit
 * @param {RateLimiter} rateLimiter - Rate limiter instance
 * @param {string} identifier - Identifier for rate limiting
 * @param {Object} options - Additional options
 * @returns {Function} - Rate-limited function
 */
export const withRateLimit = (func, rateLimiter, identifier, options = {}) => {
  const { 
    onLimitExceeded = () => {
      throw new Error('Rate limit exceeded. Please try again later.')
    },
    returnLimitInfo = false
  } = options

  return async (...args) => {
    const limitResult = rateLimiter.checkLimit(identifier)
    
    if (!limitResult.allowed) {
      return onLimitExceeded(limitResult)
    }

    try {
      const result = await func(...args)
      
      if (returnLimitInfo) {
        return {
          data: result,
          rateLimit: limitResult
        }
      }
      
      return result
    } catch (error) {
      // Optionally don't count failed requests against the limit
      // This would require implementing skipFailedRequests logic
      throw error
    }
  }
}

/**
 * Rate limit decorator for class methods
 * @param {RateLimiter} rateLimiter - Rate limiter instance
 * @param {string} identifier - Identifier for rate limiting
 * @param {Object} options - Additional options
 * @returns {Function} - Decorator function
 */
export const rateLimitDecorator = (rateLimiter, identifier, options = {}) => {
  return (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value
    
    descriptor.value = withRateLimit(originalMethod, rateLimiter, identifier, options)
    
    return descriptor
  }
}

/**
 * Create a rate-limited API client wrapper
 * @param {Object} apiClient - Original API client
 * @param {Object} rateLimitConfig - Rate limit configuration per endpoint
 * @returns {Object} - Rate-limited API client
 */
export const createRateLimitedApiClient = (apiClient, rateLimitConfig = {}) => {
  const rateLimitedClient = {}

  for (const [methodName, originalMethod] of Object.entries(apiClient)) {
    if (typeof originalMethod !== 'function') {
      rateLimitedClient[methodName] = originalMethod
      continue
    }

    const config = rateLimitConfig[methodName] || {
      rateLimiter: apiRateLimiter,
      identifier: 'default'
    }

    rateLimitedClient[methodName] = withRateLimit(
      originalMethod.bind(apiClient),
      config.rateLimiter,
      config.identifier,
      config.options
    )
  }

  return rateLimitedClient
}

/**
 * Exponential backoff utility for retrying rate-limited requests
 * @param {Function} func - Function to retry
 * @param {Object} options - Retry options
 * @returns {Function} - Function with retry logic
 */
export const withExponentialBackoff = (func, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true
  } = options

  return async (...args) => {
    let lastError
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await func(...args)
      } catch (error) {
        lastError = error
        
        // Don't retry if it's not a rate limit error
        if (!isRateLimitError(error) || attempt === maxRetries) {
          throw error
        }

        // Calculate delay with exponential backoff
        let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)
        
        // Add jitter to prevent thundering herd
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5)
        }

        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }
}

/**
 * Check if an error is a rate limit error
 * @param {Error} error - Error to check
 * @returns {boolean} - True if it's a rate limit error
 */
const isRateLimitError = (error) => {
  if (!error) return false
  
  const message = error.message?.toLowerCase() || ''
  const status = error.status || error.statusCode
  
  return (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('quota exceeded')
  )
}

/**
 * Create a rate limit middleware for request interceptors
 * @param {RateLimiter} rateLimiter - Rate limiter instance
 * @param {Function} identifierExtractor - Function to extract identifier from request
 * @returns {Function} - Middleware function
 */
export const createRateLimitMiddleware = (rateLimiter, identifierExtractor) => {
  return (request) => {
    const identifier = identifierExtractor(request)
    const limitResult = rateLimiter.checkLimit(identifier)
    
    if (!limitResult.allowed) {
      const error = new Error('Rate limit exceeded')
      error.status = 429
      error.rateLimit = limitResult
      throw error
    }

    // Add rate limit info to request headers (if supported)
    if (request.headers) {
      request.headers['X-RateLimit-Remaining'] = limitResult.remaining.toString()
      request.headers['X-RateLimit-Reset'] = limitResult.resetTime.toString()
    }

    return request
  }
}

/**
 * Browser storage-based rate limiter for persistence across sessions
 */
export class PersistentRateLimiter extends RateLimiter {
  constructor(storageKey, options = {}) {
    super(options)
    this.storageKey = storageKey
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.limits = new Map(data.limits || [])
      }
    } catch (error) {
      console.warn('Failed to load rate limit data from storage:', error)
    }
  }

  saveToStorage() {
    try {
      const data = {
        limits: Array.from(this.limits.entries()),
        timestamp: Date.now()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save rate limit data to storage:', error)
    }
  }

  checkLimit(identifier, options = {}) {
    const result = super.checkLimit(identifier, options)
    this.saveToStorage()
    return result
  }

  reset(identifier) {
    super.reset(identifier)
    this.saveToStorage()
  }

  clearAll() {
    super.clearAll()
    this.saveToStorage()
  }
}

// Export default rate limiter instances
export default {
  auth: authRateLimiter,
  api: apiRateLimiter,
  upload: uploadRateLimiter,
  search: searchRateLimiter,
  RateLimiter,
  PersistentRateLimiter
}