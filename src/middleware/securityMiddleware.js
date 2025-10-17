/**
 * Security middleware for API requests and application security
 */

import securityService from '../services/securityService.js'

/**
 * Request sanitization middleware
 * @param {Object} request - Request object
 * @param {Object} options - Middleware options
 * @returns {Object} - Sanitized request
 */
export const sanitizeRequestMiddleware = (request, options = {}) => {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeHeaders = false,
    fieldConfig = {}
  } = options

  const sanitizedRequest = { ...request }

  try {
    // Sanitize request body
    if (sanitizeBody && request.body) {
      sanitizedRequest.body = securityService.sanitizeFormData(request.body, fieldConfig)
    }

    // Sanitize query parameters
    if (sanitizeQuery && request.query) {
      const queryConfig = {}
      Object.keys(request.query).forEach(key => {
        queryConfig[key] = { type: 'text', maxLength: 1000 }
      })
      sanitizedRequest.query = securityService.sanitizeFormData(request.query, queryConfig)
    }

    // Sanitize specific headers if needed
    if (sanitizeHeaders && request.headers) {
      const headersToSanitize = ['x-custom-header', 'x-user-input']
      headersToSanitize.forEach(header => {
        if (request.headers[header]) {
          request.headers[header] = securityService.sanitizeInput(request.headers[header], 'text')
        }
      })
    }

    return sanitizedRequest
  } catch (error) {
    securityService.logSecurityEvent('request_sanitization_error', {
      error: error.message,
      url: request.url
    })
    throw new Error('Request sanitization failed')
  }
}

/**
 * Rate limiting middleware
 * @param {string} operation - Operation type for rate limiting
 * @param {Function} identifierExtractor - Function to extract identifier from request
 * @returns {Function} - Middleware function
 */
export const rateLimitMiddleware = (operation, identifierExtractor) => {
  return (request) => {
    const identifier = identifierExtractor(request)
    const rateLimitResult = securityService.checkRateLimit(operation, identifier)

    if (!rateLimitResult.allowed) {
      const error = new Error(`Rate limit exceeded for ${operation}`)
      error.status = 429
      error.rateLimit = rateLimitResult
      throw error
    }

    // Add rate limit info to request
    request.rateLimit = rateLimitResult
    return request
  }
}

/**
 * Authentication middleware
 * @param {Object} request - Request object
 * @returns {Object} - Request with validated auth
 */
export const authenticationMiddleware = (request) => {
  const token = request.headers?.authorization?.replace('Bearer ', '')
  
  if (!token) {
    const error = new Error('Authentication required')
    error.status = 401
    throw error
  }

  const validation = securityService.validateSessionToken(token)
  
  if (!validation.isValid) {
    securityService.logSecurityEvent('invalid_token_attempt', {
      reason: validation.reason,
      url: request.url
    })
    
    const error = new Error(`Authentication failed: ${validation.reason}`)
    error.status = 401
    throw error
  }

  request.user = validation.payload
  return request
}

/**
 * CSRF protection middleware
 * @param {Object} request - Request object
 * @returns {Object} - Validated request
 */
export const csrfProtectionMiddleware = (request) => {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return request
  }

  const csrfToken = request.headers['x-csrf-token'] || request.body?.csrfToken
  const sessionToken = request.headers?.authorization?.replace('Bearer ', '')

  if (!csrfToken) {
    const error = new Error('CSRF token required')
    error.status = 403
    throw error
  }

  // In a real implementation, you would validate the CSRF token
  // against a server-side generated token tied to the session
  // For now, we'll do a basic check
  if (!sessionToken || csrfToken.length < 16) {
    securityService.logSecurityEvent('csrf_validation_failed', {
      url: request.url,
      hasToken: !!csrfToken,
      tokenLength: csrfToken?.length
    })
    
    const error = new Error('Invalid CSRF token')
    error.status = 403
    throw error
  }

  return request
}

/**
 * Input validation middleware for specific endpoints
 * @param {Object} validationRules - Validation rules per field
 * @returns {Function} - Middleware function
 */
export const inputValidationMiddleware = (validationRules) => {
  return (request) => {
    if (!request.body) {
      return request
    }

    const errors = []

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = request.body[field]

      // Required field check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${field}' is required`)
        continue
      }

      // Skip validation if field is not present and not required
      if (value === undefined || value === null) {
        continue
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`)
      }

      // String length validation
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`)
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`Field '${field}' must not exceed ${rules.maxLength} characters`)
      }

      // Number range validation
      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`Field '${field}' must be at least ${rules.min}`)
      }

      if (rules.max && typeof value === 'number' && value > rules.max) {
        errors.push(`Field '${field}' must not exceed ${rules.max}`)
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Field '${field}' format is invalid`)
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`)
      }

      // Custom validation
      if (rules.validate && typeof rules.validate === 'function') {
        const customResult = rules.validate(value)
        if (customResult !== true) {
          errors.push(customResult || `Field '${field}' validation failed`)
        }
      }
    }

    if (errors.length > 0) {
      securityService.logSecurityEvent('input_validation_failed', {
        url: request.url,
        errors,
        fields: Object.keys(request.body)
      })
      
      const error = new Error(`Validation failed: ${errors.join(', ')}`)
      error.status = 400
      error.validationErrors = errors
      throw error
    }

    return request
  }
}

/**
 * File upload security middleware
 * @param {Object} options - Upload options
 * @returns {Function} - Middleware function
 */
export const fileUploadSecurityMiddleware = (options = {}) => {
  return async (request) => {
    if (!request.files || request.files.length === 0) {
      return request
    }

    try {
      const validation = await securityService.validateUploadedFiles(request.files, {
        ...options,
        userId: request.user?.sub || 'anonymous'
      })

      if (validation.invalid.length > 0) {
        const error = new Error(`File validation failed: ${validation.errors.join(', ')}`)
        error.status = 400
        error.fileValidation = validation
        throw error
      }

      // Replace files with validated and secured versions
      request.files = validation.valid.map(item => ({
        ...item.originalFile,
        secureFilename: item.secureFilename,
        validation: item.validation
      }))

      return request
    } catch (error) {
      securityService.logSecurityEvent('file_upload_security_error', {
        error: error.message,
        userId: request.user?.sub,
        fileCount: request.files.length
      })
      throw error
    }
  }
}

/**
 * Security headers middleware
 * @param {Object} response - Response object
 * @returns {Object} - Response with security headers
 */
export const securityHeadersMiddleware = (response) => {
  const headers = {
    // Content Security Policy
    'Content-Security-Policy': securityService.generateCSPHeader(),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Frame Options
    'X-Frame-Options': 'DENY',
    
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Remove server information
    'Server': '',
    'X-Powered-By': ''
  }

  // Add headers to response
  Object.entries(headers).forEach(([key, value]) => {
    if (response.headers) {
      response.headers[key] = value
    }
  })

  return response
}

/**
 * Suspicious activity detection middleware
 * @param {string} activityType - Type of activity to monitor
 * @returns {Function} - Middleware function
 */
export const suspiciousActivityMiddleware = (activityType) => {
  return (request) => {
    const userId = request.user?.sub || request.ip || 'anonymous'
    
    const isSuspicious = securityService.checkSuspiciousActivity(userId, activityType, {
      url: request.url,
      userAgent: request.headers?.['user-agent'],
      timestamp: Date.now()
    })

    if (isSuspicious) {
      // You might want to implement additional actions here:
      // - Require additional authentication
      // - Temporarily block the user
      // - Send alerts to administrators
      
      securityService.logSecurityEvent('suspicious_activity_threshold_exceeded', {
        userId,
        activityType,
        url: request.url
      })
    }

    request.suspiciousActivity = isSuspicious
    return request
  }
}

/**
 * Create a middleware pipeline
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} - Combined middleware function
 */
export const createMiddlewarePipeline = (middlewares) => {
  return async (request) => {
    let processedRequest = request

    for (const middleware of middlewares) {
      try {
        processedRequest = await middleware(processedRequest)
      } catch (error) {
        // Log middleware error
        securityService.logSecurityEvent('middleware_error', {
          middleware: middleware.name,
          error: error.message,
          url: request.url
        })
        throw error
      }
    }

    return processedRequest
  }
}

/**
 * Common middleware configurations for different endpoints
 */
export const middlewareConfigs = {
  // Authentication endpoints
  auth: [
    (req) => rateLimitMiddleware('auth', () => req.ip || 'anonymous')(req),
    (req) => sanitizeRequestMiddleware(req, {
      fieldConfig: {
        email: { type: 'email' },
        password: { type: 'text', maxLength: 128 }
      }
    }),
    (req) => inputValidationMiddleware({
      email: { 
        required: true, 
        type: 'string', 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
      },
      password: { 
        required: true, 
        type: 'string', 
        minLength: 8, 
        maxLength: 128 
      }
    })(req)
  ],

  // Ticket creation
  createTicket: [
    authenticationMiddleware,
    (req) => rateLimitMiddleware('api', (r) => r.user?.sub || 'anonymous')(req),
    csrfProtectionMiddleware,
    (req) => sanitizeRequestMiddleware(req, {
      fieldConfig: {
        titulo: { type: 'text', maxLength: 200 },
        descripcion: { type: 'html' },
        prioridad: { type: 'text', maxLength: 20 }
      }
    }),
    (req) => inputValidationMiddleware({
      titulo: { required: true, type: 'string', minLength: 5, maxLength: 200 },
      descripcion: { required: true, type: 'string', minLength: 10 },
      prioridad: { 
        required: true, 
        type: 'string', 
        enum: ['baja', 'media', 'alta', 'urgente'] 
      }
    })(req),
    (req) => suspiciousActivityMiddleware('ticket_creation')(req)
  ],

  // File upload
  fileUpload: [
    authenticationMiddleware,
    (req) => rateLimitMiddleware('upload', (r) => r.user?.sub || 'anonymous')(req),
    csrfProtectionMiddleware,
    (req) => fileUploadSecurityMiddleware({
      allowedTypes: ['images', 'videos', 'documents', 'audio'],
      maxFiles: 5,
      maxTotalSize: 100 * 1024 * 1024 // 100MB
    })(req),
    (req) => suspiciousActivityMiddleware('file_upload')(req)
  ],

  // Search
  search: [
    authenticationMiddleware,
    (req) => rateLimitMiddleware('search', (r) => r.user?.sub || 'anonymous')(req),
    (req) => sanitizeRequestMiddleware(req, {
      fieldConfig: {
        query: { type: 'text', maxLength: 500 },
        filters: { type: 'text' }
      }
    }),
    (req) => inputValidationMiddleware({
      query: { type: 'string', maxLength: 500 }
    })(req)
  ]
}

export default {
  sanitizeRequestMiddleware,
  rateLimitMiddleware,
  authenticationMiddleware,
  csrfProtectionMiddleware,
  inputValidationMiddleware,
  fileUploadSecurityMiddleware,
  securityHeadersMiddleware,
  suspiciousActivityMiddleware,
  createMiddlewarePipeline,
  middlewareConfigs
}