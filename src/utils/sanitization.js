/**
 * Input sanitization utilities to prevent XSS attacks and ensure data security
 */

/**
 * HTML sanitization configuration
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
]

const ALLOWED_ATTRIBUTES = {
  '*': ['class'],
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'width', 'height'],
  'code': ['class']
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHtml = (html, options = {}) => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  const {
    allowedTags = ALLOWED_TAGS,
    allowedAttributes = ALLOWED_ATTRIBUTES,
    stripTags = false
  } = options

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '')

  // Remove dangerous attributes
  const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]*`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  if (stripTags) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // Filter allowed tags and attributes
    sanitized = filterHtmlTags(sanitized, allowedTags, allowedAttributes)
  }

  // Decode HTML entities to prevent double encoding
  sanitized = decodeHtmlEntities(sanitized)

  return sanitized.trim()
}

/**
 * Filter HTML tags and attributes
 * @param {string} html - HTML content
 * @param {string[]} allowedTags - Allowed HTML tags
 * @param {Object} allowedAttributes - Allowed attributes per tag
 * @returns {string} - Filtered HTML
 */
const filterHtmlTags = (html, allowedTags, allowedAttributes) => {
  return html.replace(/<(\/?)([\w-]+)([^>]*)>/gi, (match, slash, tag, attributes) => {
    const tagLower = tag.toLowerCase()
    
    // Remove disallowed tags
    if (!allowedTags.includes(tagLower)) {
      return ''
    }

    // For closing tags, just return them
    if (slash) {
      return `</${tagLower}>`
    }

    // Filter attributes
    const filteredAttributes = filterAttributes(attributes, tagLower, allowedAttributes)
    
    return `<${tagLower}${filteredAttributes}>`
  })
}

/**
 * Filter HTML attributes
 * @param {string} attributes - Attribute string
 * @param {string} tag - HTML tag name
 * @param {Object} allowedAttributes - Allowed attributes configuration
 * @returns {string} - Filtered attributes
 */
const filterAttributes = (attributes, tag, allowedAttributes) => {
  if (!attributes) return ''

  const tagAllowed = allowedAttributes[tag] || []
  const globalAllowed = allowedAttributes['*'] || []
  const allowed = [...tagAllowed, ...globalAllowed]

  return attributes.replace(/(\w+)\s*=\s*["']([^"']*)["']/gi, (match, attr, value) => {
    const attrLower = attr.toLowerCase()
    
    if (!allowed.includes(attrLower)) {
      return ''
    }

    // Additional validation for specific attributes
    if (attrLower === 'href') {
      // Only allow safe protocols
      if (!/^(https?|mailto|tel):/i.test(value) && !value.startsWith('/') && !value.startsWith('#')) {
        return ''
      }
    }

    if (attrLower === 'src') {
      // Only allow safe image sources
      if (!/^(https?:|data:image\/)/i.test(value) && !value.startsWith('/')) {
        return ''
      }
    }

    return ` ${attrLower}="${escapeHtml(value)}"`
  })
}

/**
 * Decode HTML entities
 * @param {string} html - HTML with entities
 * @returns {string} - Decoded HTML
 */
const decodeHtmlEntities = (html) => {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  }

  return html.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  return text.replace(/[&<>"'`=/]/g, (char) => entityMap[char])
}

/**
 * Sanitize text input to prevent injection attacks
 * @param {string} input - Input text
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const {
    maxLength = 10000,
    allowNewlines = true,
    trimWhitespace = true
  } = options

  let sanitized = input

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ')
  }

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim()
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Basic email sanitization
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '')
    .substring(0, 254) // RFC 5321 limit
}

/**
 * Sanitize URL input
 * @param {string} url - URL to sanitize
 * @param {string[]} allowedProtocols - Allowed URL protocols
 * @returns {string} - Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url, allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']) => {
  if (!url || typeof url !== 'string') {
    return ''
  }

  try {
    const urlObj = new URL(url.trim())
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return ''
    }

    return urlObj.toString()
  } catch (error) {
    // If URL is invalid, return empty string
    return ''
  }
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'file'
  }

  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\.+/, '')
    .trim()

  // Ensure filename is not empty and not too long
  if (!sanitized || sanitized === '.') {
    sanitized = 'file'
  }

  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    const name = sanitized.substring(0, 255 - ext.length)
    sanitized = name + ext
  }

  return sanitized
}

/**
 * Validate and sanitize JSON input
 * @param {string} jsonString - JSON string to validate
 * @param {Object} schema - Optional schema for validation
 * @returns {Object} - Parsed and validated JSON or null if invalid
 */
export const sanitizeJson = (jsonString, schema = null) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(jsonString)
    
    // Basic type validation
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    // If schema provided, validate against it
    if (schema) {
      return validateAgainstSchema(parsed, schema) ? parsed : null
    }

    return parsed
  } catch (error) {
    return null
  }
}

/**
 * Basic schema validation (simplified)
 * @param {Object} data - Data to validate
 * @param {Object} schema - Schema definition
 * @returns {boolean} - True if valid
 */
const validateAgainstSchema = (data, schema) => {
  // This is a simplified implementation
  // In production, use a proper JSON schema validator like Ajv
  
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in data)) {
      return false
    }
    
    if (typeof data[key] !== type) {
      return false
    }
  }
  
  return true
}

/**
 * Sanitize SQL-like input to prevent injection (basic protection)
 * @param {string} input - Input that might contain SQL
 * @returns {string} - Sanitized input
 */
export const sanitizeSqlInput = (input) => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
  ]

  let sanitized = input
  
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized.trim()
}

/**
 * Comprehensive input sanitization for form data
 * @param {Object} formData - Form data object
 * @param {Object} fieldConfig - Configuration for each field
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData, fieldConfig = {}) => {
  const sanitized = {}

  for (const [key, value] of Object.entries(formData)) {
    const config = fieldConfig[key] || {}
    const { type = 'text', ...options } = config

    switch (type) {
      case 'html':
        sanitized[key] = sanitizeHtml(value, options)
        break
      case 'email':
        sanitized[key] = sanitizeEmail(value)
        break
      case 'url':
        sanitized[key] = sanitizeUrl(value, options.allowedProtocols)
        break
      case 'filename':
        sanitized[key] = sanitizeFilename(value)
        break
      case 'json':
        sanitized[key] = sanitizeJson(value, options.schema)
        break
      case 'sql':
        sanitized[key] = sanitizeSqlInput(value)
        break
      default:
        sanitized[key] = sanitizeText(value, options)
    }
  }

  return sanitized
}