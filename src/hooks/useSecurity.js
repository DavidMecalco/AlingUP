/**
 * Security hook for React components
 * Provides easy access to security features and validation
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import securityService from '../services/securityService.js'
import { RATE_LIMITS, VALIDATION_RULES } from '../config/security.js'

/**
 * Custom hook for security operations
 * @param {Object} options - Hook configuration options
 * @returns {Object} - Security utilities and state
 */
export const useSecurity = (options = {}) => {
  const {
    enableRateLimit = true,
    enableInputValidation = true,
    enableSuspiciousActivityDetection = true,
    userId = 'anonymous'
  } = options

  const [securityState, setSecurityState] = useState({
    isRateLimited: false,
    rateLimitInfo: null,
    validationErrors: {},
    suspiciousActivity: false,
    securityEvents: []
  })

  const securityEventListenerRef = useRef(null)

  // Set up security event listener
  useEffect(() => {
    if (securityEventListenerRef.current) {
      securityService.removeSecurityEventListener(securityEventListenerRef.current)
    }

    securityEventListenerRef.current = (event) => {
      setSecurityState(prev => ({
        ...prev,
        securityEvents: [...prev.securityEvents.slice(-9), event] // Keep last 10 events
      }))
    }

    securityService.addSecurityEventListener(securityEventListenerRef.current)

    return () => {
      if (securityEventListenerRef.current) {
        securityService.removeSecurityEventListener(securityEventListenerRef.current)
      }
    }
  }, [])

  /**
   * Check rate limit for an operation
   * @param {string} operation - Operation type
   * @param {Object} options - Rate limit options
   * @returns {Object} - Rate limit result
   */
  const checkRateLimit = useCallback((operation, rateLimitOptions = {}) => {
    if (!enableRateLimit) {
      return { allowed: true, remaining: Infinity }
    }

    try {
      const result = securityService.checkRateLimit(operation, userId, rateLimitOptions)
      
      setSecurityState(prev => ({
        ...prev,
        isRateLimited: !result.allowed,
        rateLimitInfo: result
      }))

      return result
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return { allowed: true, remaining: 0, error: error.message }
    }
  }, [enableRateLimit, userId])

  /**
   * Sanitize input data
   * @param {any} input - Input to sanitize
   * @param {string} context - Sanitization context
   * @param {Object} options - Sanitization options
   * @returns {any} - Sanitized input
   */
  const sanitizeInput = useCallback((input, context = 'text', sanitizeOptions = {}) => {
    try {
      return securityService.sanitizeInput(input, context, sanitizeOptions)
    } catch (error) {
      console.error('Input sanitization failed:', error)
      return input // Return original input on error (not ideal, but prevents breaking)
    }
  }, [])

  /**
   * Validate form data
   * @param {Object} formData - Form data to validate
   * @param {string} formType - Type of form (ticket, auth, comment, etc.)
   * @param {Object} customRules - Custom validation rules
   * @returns {Object} - Validation result
   */
  const validateForm = useCallback((formData, formType, customRules = {}) => {
    if (!enableInputValidation) {
      return { isValid: true, errors: {} }
    }

    try {
      const rules = { ...VALIDATION_RULES[formType], ...customRules }
      const errors = {}
      let isValid = true

      for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field]
        const fieldErrors = []

        // Required field check
        if (rule.required && (value === undefined || value === null || value === '')) {
          fieldErrors.push(`${field} is required`)
          isValid = false
        }

        // Skip further validation if field is empty and not required
        if (!rule.required && (value === undefined || value === null || value === '')) {
          continue
        }

        // Type validation
        if (rule.type && typeof value !== rule.type) {
          fieldErrors.push(`${field} must be of type ${rule.type}`)
          isValid = false
        }

        // String validations
        if (rule.type === 'string' && typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            fieldErrors.push(`${field} must be at least ${rule.minLength} characters`)
            isValid = false
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`)
            isValid = false
          }

          if (rule.pattern && !rule.pattern.test(value)) {
            fieldErrors.push(`${field} format is invalid`)
            isValid = false
          }
        }

        // Number validations
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min && value < rule.min) {
            fieldErrors.push(`${field} must be at least ${rule.min}`)
            isValid = false
          }

          if (rule.max && value > rule.max) {
            fieldErrors.push(`${field} must not exceed ${rule.max}`)
            isValid = false
          }
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
          fieldErrors.push(`${field} must be one of: ${rule.enum.join(', ')}`)
          isValid = false
        }

        // Custom validation
        if (rule.validate && typeof rule.validate === 'function') {
          const customResult = rule.validate(value, formData)
          if (customResult !== true) {
            fieldErrors.push(customResult || `${field} validation failed`)
            isValid = false
          }
        }

        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors
        }
      }

      const result = { isValid, errors }

      setSecurityState(prev => ({
        ...prev,
        validationErrors: errors
      }))

      return result
    } catch (error) {
      console.error('Form validation failed:', error)
      return { isValid: false, errors: { general: ['Validation failed'] } }
    }
  }, [enableInputValidation])

  /**
   * Validate uploaded files
   * @param {FileList|File[]} files - Files to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  const validateFiles = useCallback(async (files, validateOptions = {}) => {
    try {
      const result = await securityService.validateUploadedFiles(files, {
        userId,
        ...validateOptions
      })

      return result
    } catch (error) {
      console.error('File validation failed:', error)
      return {
        valid: [],
        invalid: Array.from(files).map((file, index) => ({
          file,
          index,
          validation: { isValid: false, errors: ['Validation failed'] }
        })),
        errors: ['File validation failed'],
        warnings: []
      }
    }
  }, [userId])

  /**
   * Create a rate-limited function
   * @param {Function} func - Function to rate limit
   * @param {string} operation - Rate limit operation type
   * @param {Object} options - Rate limit options
   * @returns {Function} - Rate-limited function
   */
  const withRateLimit = useCallback((func, operation, rateLimitOptions = {}) => {
    if (!enableRateLimit) {
      return func
    }

    return securityService.withRateLimit(func, operation, userId, rateLimitOptions)
  }, [enableRateLimit, userId])

  /**
   * Check for suspicious activity
   * @param {string} activity - Activity type
   * @param {Object} metadata - Activity metadata
   * @returns {boolean} - True if activity is suspicious
   */
  const checkSuspiciousActivity = useCallback((activity, metadata = {}) => {
    if (!enableSuspiciousActivityDetection) {
      return false
    }

    try {
      const isSuspicious = securityService.checkSuspiciousActivity(userId, activity, metadata)
      
      setSecurityState(prev => ({
        ...prev,
        suspiciousActivity: isSuspicious
      }))

      return isSuspicious
    } catch (error) {
      console.error('Suspicious activity check failed:', error)
      return false
    }
  }, [enableSuspiciousActivityDetection, userId])

  /**
   * Sanitize and validate form data in one step
   * @param {Object} formData - Form data
   * @param {string} formType - Form type
   * @param {Object} options - Options for sanitization and validation
   * @returns {Object} - Sanitized data and validation result
   */
  const sanitizeAndValidate = useCallback((formData, formType, options = {}) => {
    const { sanitizationConfig = {}, validationRules = {} } = options

    try {
      // First sanitize the data
      const sanitizedData = securityService.sanitizeFormData(formData, sanitizationConfig)

      // Then validate the sanitized data
      const validation = validateForm(sanitizedData, formType, validationRules)

      return {
        data: sanitizedData,
        validation,
        isValid: validation.isValid,
        errors: validation.errors
      }
    } catch (error) {
      console.error('Sanitize and validate failed:', error)
      return {
        data: formData,
        validation: { isValid: false, errors: { general: ['Processing failed'] } },
        isValid: false,
        errors: { general: ['Processing failed'] }
      }
    }
  }, [validateForm])

  /**
   * Clear security state
   */
  const clearSecurityState = useCallback(() => {
    setSecurityState({
      isRateLimited: false,
      rateLimitInfo: null,
      validationErrors: {},
      suspiciousActivity: false,
      securityEvents: []
    })
  }, [])

  /**
   * Get security status summary
   * @returns {Object} - Security status
   */
  const getSecurityStatus = useCallback(() => {
    return {
      isSecure: !securityState.isRateLimited && 
                Object.keys(securityState.validationErrors).length === 0 && 
                !securityState.suspiciousActivity,
      rateLimited: securityState.isRateLimited,
      hasValidationErrors: Object.keys(securityState.validationErrors).length > 0,
      suspiciousActivity: securityState.suspiciousActivity,
      recentEvents: securityState.securityEvents.slice(-5) // Last 5 events
    }
  }, [securityState])

  return {
    // State
    securityState,
    
    // Rate limiting
    checkRateLimit,
    withRateLimit,
    
    // Input sanitization and validation
    sanitizeInput,
    validateForm,
    validateFiles,
    sanitizeAndValidate,
    
    // Security monitoring
    checkSuspiciousActivity,
    
    // Utilities
    clearSecurityState,
    getSecurityStatus,
    
    // Computed values
    isRateLimited: securityState.isRateLimited,
    hasValidationErrors: Object.keys(securityState.validationErrors).length > 0,
    isSuspicious: securityState.suspiciousActivity
  }
}

/**
 * Hook for file upload security
 * @param {Object} options - Upload options
 * @returns {Object} - File upload security utilities
 */
export const useFileUploadSecurity = (options = {}) => {
  const { userId = 'anonymous' } = options
  const [uploadState, setUploadState] = useState({
    isValidating: false,
    validationResults: null,
    uploadProgress: {}
  })

  /**
   * Validate files before upload
   * @param {FileList|File[]} files - Files to validate
   * @param {Object} validateOptions - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  const validateFilesForUpload = useCallback(async (files, validateOptions = {}) => {
    setUploadState(prev => ({ ...prev, isValidating: true }))

    try {
      const result = await securityService.validateUploadedFiles(files, {
        userId,
        ...validateOptions
      })

      setUploadState(prev => ({
        ...prev,
        isValidating: false,
        validationResults: result
      }))

      return result
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isValidating: false,
        validationResults: {
          valid: [],
          invalid: Array.from(files),
          errors: [error.message]
        }
      }))

      throw error
    }
  }, [userId])

  /**
   * Update upload progress
   * @param {string} fileId - File identifier
   * @param {number} progress - Progress percentage (0-100)
   */
  const updateUploadProgress = useCallback((fileId, progress) => {
    setUploadState(prev => ({
      ...prev,
      uploadProgress: {
        ...prev.uploadProgress,
        [fileId]: progress
      }
    }))
  }, [])

  /**
   * Clear upload state
   */
  const clearUploadState = useCallback(() => {
    setUploadState({
      isValidating: false,
      validationResults: null,
      uploadProgress: {}
    })
  }, [])

  return {
    uploadState,
    validateFilesForUpload,
    updateUploadProgress,
    clearUploadState,
    isValidating: uploadState.isValidating
  }
}

export default useSecurity