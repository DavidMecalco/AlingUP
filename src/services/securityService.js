/**
 * Comprehensive security service for the ticket management portal
 * Integrates input sanitization, rate limiting, and file validation
 */

import { 
  sanitizeHtml, 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeUrl, 
  sanitizeFormData,
  escapeHtml 
} from '../utils/sanitization.js'

import { 
  authRateLimiter, 
  apiRateLimiter, 
  uploadRateLimiter, 
  searchRateLimiter,
  withRateLimit,
  withExponentialBackoff 
} from '../utils/rateLimiting.js'

import { 
  validateFile, 
  validateFiles, 
  createValidationPipeline,
  generateSecureFilename 
} from '../utils/fileValidation.js'

/**
 * Security service class that provides comprehensive security measures
 */
class SecurityService {
  constructor() {
    this.rateLimiters = {
      auth: authRateLimiter,
      api: apiRateLimiter,
      upload: uploadRateLimiter,
      search: searchRateLimiter
    }

    // Create validation pipeline with strict security settings
    this.fileValidationPipeline = createValidationPipeline({
      enableMimeValidation: true,
      enableMalwareScan: true,
      enableContentScan: true,
      customValidators: [this.customFileValidator.bind(this)]
    })

    // Security event listeners
    this.securityEventListeners = new Set()
    
    // Initialize security monitoring
    this.initializeSecurityMonitoring()
  }

  /**
   * Initialize security monitoring and event handling
   */
  initializeSecurityMonitoring() {
    // Monitor for suspicious activities
    this.suspiciousActivityThreshold = 5
    this.suspiciousActivities = new Map()

    // Set up periodic cleanup of old data
    setInterval(() => {
      this.cleanupOldSecurityData()
    }, 60000) // Every minute
  }

  /**
   * Sanitize user input based on context
   * @param {any} input - Input to sanitize
   * @param {string} context - Context type (html, text, email, url, etc.)
   * @param {Object} options - Sanitization options
   * @returns {any} - Sanitized input
   */
  sanitizeInput(input, context = 'text', options = {}) {
    try {
      switch (context) {
        case 'html':
          return sanitizeHtml(input, options)
        case 'email':
          return sanitizeEmail(input)
        case 'url':
          return sanitizeUrl(input, options.allowedProtocols)
        case 'text':
        default:
          return sanitizeText(input, options)
      }
    } catch (error) {
      this.logSecurityEvent('sanitization_error', { context, error: error.message })
      return '' // Return empty string on error for safety
    }
  }

  /**
   * Sanitize form data with field-specific rules
   * @param {Object} formData - Form data to sanitize
   * @param {Object} fieldConfig - Configuration for each field
   * @returns {Object} - Sanitized form data
   */
  sanitizeFormData(formData, fieldConfig = {}) {
    try {
      return sanitizeFormData(formData, fieldConfig)
    } catch (error) {
      this.logSecurityEvent('form_sanitization_error', { error: error.message })
      throw new Error('Form data sanitization failed')
    }
  }

  /**
   * Check rate limits for different operations
   * @param {string} operation - Operation type (auth, api, upload, search)
   * @param {string} identifier - User/IP identifier
   * @param {Object} options - Additional options
   * @returns {Object} - Rate limit result
   */
  checkRateLimit(operation, identifier, options = {}) {
    const rateLimiter = this.rateLimiters[operation]
    if (!rateLimiter) {
      throw new Error(`Unknown rate limit operation: ${operation}`)
    }

    const result = rateLimiter.checkLimit(identifier, options)
    
    if (!result.allowed) {
      this.logSecurityEvent('rate_limit_exceeded', {
        operation,
        identifier,
        remaining: result.remaining,
        resetTime: result.resetTime
      })
    }

    return result
  }

  /**
   * Create a rate-limited version of a function
   * @param {Function} func - Function to rate limit
   * @param {string} operation - Rate limit operation type
   * @param {string} identifier - Identifier for rate limiting
   * @param {Object} options - Additional options
   * @returns {Function} - Rate-limited function
   */
  withRateLimit(func, operation, identifier, options = {}) {
    const rateLimiter = this.rateLimiters[operation]
    if (!rateLimiter) {
      throw new Error(`Unknown rate limit operation: ${operation}`)
    }

    return withRateLimit(func, rateLimiter, identifier, {
      ...options,
      onLimitExceeded: (limitResult) => {
        this.logSecurityEvent('rate_limit_exceeded', {
          operation,
          identifier,
          limitResult
        })
        throw new Error(`Rate limit exceeded for ${operation}. Try again in ${Math.ceil((limitResult.resetTime - Date.now()) / 1000)} seconds.`)
      }
    })
  }

  /**
   * Validate uploaded files with comprehensive security checks
   * @param {FileList|File[]} files - Files to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation results
   */
  async validateUploadedFiles(files, options = {}) {
    try {
      // Apply rate limiting for file uploads
      const identifier = options.userId || 'anonymous'
      const rateLimitResult = this.checkRateLimit('upload', identifier)
      
      if (!rateLimitResult.allowed) {
        throw new Error('Upload rate limit exceeded')
      }

      // Validate files using the security pipeline
      const fileArray = Array.from(files)
      const results = {
        valid: [],
        invalid: [],
        errors: [],
        warnings: [],
        totalSize: 0
      }

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const validation = await this.fileValidationPipeline(file, options)
        
        results.totalSize += file.size

        if (validation.isValid) {
          // Generate secure filename
          const secureFilename = generateSecureFilename(file.name, {
            addTimestamp: true,
            addRandomSuffix: true,
            preserveExtension: true
          })

          results.valid.push({
            originalFile: file,
            secureFilename,
            validation,
            index: i
          })
        } else {
          results.invalid.push({
            file,
            validation,
            index: i
          })
          results.errors.push(`File ${i + 1} (${file.name}): ${validation.errors.join(', ')}`)
        }

        if (validation.warnings.length > 0) {
          results.warnings.push(`File ${i + 1} (${file.name}): ${validation.warnings.join(', ')}`)
        }
      }

      // Log security events for invalid files
      if (results.invalid.length > 0) {
        this.logSecurityEvent('invalid_file_upload', {
          userId: identifier,
          invalidFiles: results.invalid.length,
          totalFiles: fileArray.length,
          errors: results.errors
        })
      }

      return results
    } catch (error) {
      this.logSecurityEvent('file_validation_error', {
        error: error.message,
        userId: options.userId
      })
      throw error
    }
  }

  /**
   * Custom file validator for additional security checks
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  async customFileValidator(file, options = {}) {
    const errors = []
    const warnings = []

    // Check for suspicious file names
    const suspiciousPatterns = [
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /\.(php|asp|aspx|jsp|cgi|pl|py|rb|sh|bat|cmd)$/i, // Server-side scripts
      /\.(htaccess|htpasswd|web\.config)$/i, // Server config files
    ]

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(file.name)) {
        errors.push('Suspicious filename detected')
      }
    })

    // Check for files with multiple extensions
    const extensionCount = (file.name.match(/\./g) || []).length
    if (extensionCount > 2) {
      warnings.push('File has multiple extensions')
    }

    // Check for very large files that might be used for DoS
    const maxSingleFileSize = options.maxSingleFileSize || 100 * 1024 * 1024 // 100MB
    if (file.size > maxSingleFileSize) {
      errors.push(`File too large: ${file.size} bytes`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate and sanitize ticket data
   * @param {Object} ticketData - Ticket data to validate
   * @returns {Object} - Sanitized ticket data
   */
  validateTicketData(ticketData) {
    const fieldConfig = {
      titulo: { 
        type: 'text', 
        maxLength: 200, 
        allowNewlines: false 
      },
      descripcion: { 
        type: 'html',
        allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'code', 'pre'],
        allowedAttributes: { '*': ['class'] }
      },
      prioridad: { 
        type: 'text', 
        maxLength: 20 
      },
      tipo_ticket_id: { 
        type: 'text', 
        maxLength: 36 
      }
    }

    try {
      const sanitized = this.sanitizeFormData(ticketData, fieldConfig)
      
      // Additional validation
      const validPriorities = ['baja', 'media', 'alta', 'urgente']
      if (sanitized.prioridad && !validPriorities.includes(sanitized.prioridad)) {
        throw new Error('Invalid priority value')
      }

      // Validate UUID format for tipo_ticket_id
      if (sanitized.tipo_ticket_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sanitized.tipo_ticket_id)) {
        throw new Error('Invalid ticket type ID format')
      }

      return sanitized
    } catch (error) {
      this.logSecurityEvent('ticket_validation_error', {
        error: error.message,
        ticketData: Object.keys(ticketData)
      })
      throw error
    }
  }

  /**
   * Validate and sanitize comment data
   * @param {Object} commentData - Comment data to validate
   * @returns {Object} - Sanitized comment data
   */
  validateCommentData(commentData) {
    const fieldConfig = {
      contenido: {
        type: 'html',
        allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'code', 'pre', 'a'],
        allowedAttributes: { 
          '*': ['class'],
          'a': ['href', 'title', 'target']
        }
      }
    }

    try {
      return this.sanitizeFormData(commentData, fieldConfig)
    } catch (error) {
      this.logSecurityEvent('comment_validation_error', {
        error: error.message
      })
      throw error
    }
  }

  /**
   * Check for suspicious user activity
   * @param {string} userId - User ID
   * @param {string} activity - Activity type
   * @param {Object} metadata - Additional activity metadata
   */
  checkSuspiciousActivity(userId, activity, metadata = {}) {
    const key = `${userId}:${activity}`
    const now = Date.now()
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, [])
    }

    const activities = this.suspiciousActivities.get(key)
    
    // Add current activity
    activities.push({ timestamp: now, metadata })
    
    // Remove activities older than 1 hour
    const oneHourAgo = now - 60 * 60 * 1000
    const recentActivities = activities.filter(a => a.timestamp > oneHourAgo)
    this.suspiciousActivities.set(key, recentActivities)

    // Check if threshold exceeded
    if (recentActivities.length >= this.suspiciousActivityThreshold) {
      this.logSecurityEvent('suspicious_activity_detected', {
        userId,
        activity,
        count: recentActivities.length,
        timeframe: '1 hour',
        activities: recentActivities
      })

      return true
    }

    return false
  }

  /**
   * Log security events
   * @param {string} eventType - Type of security event
   * @param {Object} data - Event data
   */
  logSecurityEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event)
    }

    // Notify listeners
    this.securityEventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Security event listener error:', error)
      }
    })

    // In production, you would send this to a security monitoring service
    // Example: sendToSecurityService(event)
  }

  /**
   * Add security event listener
   * @param {Function} listener - Event listener function
   */
  addSecurityEventListener(listener) {
    this.securityEventListeners.add(listener)
  }

  /**
   * Remove security event listener
   * @param {Function} listener - Event listener function
   */
  removeSecurityEventListener(listener) {
    this.securityEventListeners.delete(listener)
  }

  /**
   * Clean up old security data to prevent memory leaks
   */
  cleanupOldSecurityData() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Clean up suspicious activities
    for (const [key, activities] of this.suspiciousActivities.entries()) {
      const recentActivities = activities.filter(a => a.timestamp > oneHourAgo)
      
      if (recentActivities.length === 0) {
        this.suspiciousActivities.delete(key)
      } else {
        this.suspiciousActivities.set(key, recentActivities)
      }
    }
  }

  /**
   * Create a secure API wrapper with rate limiting and input validation
   * @param {Object} apiClient - Original API client
   * @param {Object} config - Security configuration
   * @returns {Object} - Secured API client
   */
  createSecureApiClient(apiClient, config = {}) {
    const securedClient = {}

    for (const [methodName, originalMethod] of Object.entries(apiClient)) {
      if (typeof originalMethod !== 'function') {
        securedClient[methodName] = originalMethod
        continue
      }

      securedClient[methodName] = async (...args) => {
        try {
          // Apply rate limiting
          const identifier = config.getIdentifier ? config.getIdentifier() : 'default'
          const rateLimitResult = this.checkRateLimit('api', identifier)
          
          if (!rateLimitResult.allowed) {
            throw new Error('API rate limit exceeded')
          }

          // Sanitize input data if provided
          if (args.length > 0 && typeof args[0] === 'object' && config.sanitizeInput) {
            args[0] = this.sanitizeFormData(args[0], config.fieldConfig || {})
          }

          // Call original method with retry logic
          const methodWithRetry = withExponentialBackoff(originalMethod.bind(apiClient), {
            maxRetries: 2,
            baseDelay: 1000
          })

          return await methodWithRetry(...args)
        } catch (error) {
          this.logSecurityEvent('api_error', {
            method: methodName,
            error: error.message,
            args: args.length
          })
          throw error
        }
      }
    }

    return securedClient
  }

  /**
   * Generate Content Security Policy header value
   * @returns {string} - CSP header value
   */
  generateCSPHeader() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be avoided in production
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    return cspDirectives.join('; ')
  }

  /**
   * Validate session token and check for security issues
   * @param {string} token - JWT token to validate
   * @returns {Object} - Validation result
   */
  validateSessionToken(token) {
    try {
      if (!token) {
        return { isValid: false, reason: 'No token provided' }
      }

      // Basic JWT structure check
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { isValid: false, reason: 'Invalid token structure' }
      }

      // Decode payload (without verification - this is just for basic checks)
      const payload = JSON.parse(atob(parts[1]))
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { isValid: false, reason: 'Token expired' }
      }

      // Check if token was issued too far in the future (clock skew protection)
      if (payload.iat && payload.iat * 1000 > Date.now() + 300000) { // 5 minutes
        return { isValid: false, reason: 'Token issued in future' }
      }

      return { isValid: true, payload }
    } catch (error) {
      this.logSecurityEvent('token_validation_error', {
        error: error.message
      })
      return { isValid: false, reason: 'Token parsing failed' }
    }
  }
}

// Create and export singleton instance
const securityService = new SecurityService()

export default securityService
export { SecurityService }