/**
 * Secure file upload validation utilities
 */

/**
 * File type configurations with security constraints
 */
export const FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
    mimeTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxDimensions: { width: 4000, height: 4000 }
  },
  videos: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    mimeTypes: [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
      'video/x-matroska'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 600 // 10 minutes in seconds
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text'
    ],
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  audio: {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/aac',
      'audio/flac'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    maxDuration: 1800 // 30 minutes in seconds
  }
}

/**
 * Dangerous file extensions that should never be allowed
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.run', '.bin',
  '.sh', '.ps1', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl'
]

/**
 * Dangerous MIME types that should never be allowed
 */
const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-msi',
  'application/x-bat',
  'application/x-sh',
  'application/javascript',
  'text/javascript',
  'application/x-php',
  'application/x-httpd-php'
]

/**
 * Validate file security and constraints
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Promise<{isValid: boolean, errors: string[], warnings: string[]}>}
 */
export const validateFile = async (file, options = {}) => {
  const {
    allowedTypes = ['images', 'videos', 'documents', 'audio'],
    customRules = {},
    strictMode = true,
    scanContent = true
  } = options

  const errors = []
  const warnings = []

  // Basic file existence check
  if (!file || !(file instanceof File)) {
    errors.push('Invalid file object')
    return { isValid: false, errors, warnings }
  }

  // Check for dangerous extensions
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    errors.push(`Dangerous file type not allowed: ${fileExtension}`)
    return { isValid: false, errors, warnings }
  }

  // Check for dangerous MIME types
  if (DANGEROUS_MIME_TYPES.includes(file.type)) {
    errors.push(`Dangerous MIME type not allowed: ${file.type}`)
    return { isValid: false, errors, warnings }
  }

  // Validate against allowed file types
  let typeConfig = null
  let matchedType = null

  for (const typeName of allowedTypes) {
    const config = FILE_TYPES[typeName]
    if (!config) continue

    const extensionMatch = config.extensions.includes(fileExtension)
    const mimeMatch = config.mimeTypes.includes(file.type)

    if (extensionMatch || mimeMatch) {
      typeConfig = config
      matchedType = typeName
      break
    }
  }

  if (!typeConfig) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    return { isValid: false, errors, warnings }
  }

  // Validate file size
  if (file.size > typeConfig.maxSize) {
    errors.push(`File size exceeds limit. Maximum: ${formatFileSize(typeConfig.maxSize)}, actual: ${formatFileSize(file.size)}`)
  }

  // Validate file name
  if (fileName.length > 255) {
    errors.push('File name too long (maximum 255 characters)')
  }

  // Check for null bytes in filename
  if (fileName.includes('\0')) {
    errors.push('File name contains invalid characters')
  }

  // Additional validation based on file type
  if (matchedType === 'images' && scanContent) {
    try {
      await validateImageFile(file, typeConfig)
    } catch (error) {
      errors.push(`Image validation failed: ${error.message}`)
    }
  }

  // Apply custom rules if provided
  if (customRules[matchedType]) {
    try {
      const customResult = await customRules[matchedType](file, typeConfig)
      if (customResult.errors) {
        errors.push(...customResult.errors)
      }
      if (customResult.warnings) {
        warnings.push(...customResult.warnings)
      }
    } catch (error) {
      errors.push(`Custom validation failed: ${error.message}`)
    }
  }

  // Strict mode additional checks
  if (strictMode) {
    // Check for suspicious file patterns
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      errors.push('File name contains suspicious path characters')
    }

    // Check for hidden files
    if (fileName.startsWith('.') && fileName !== '.htaccess') {
      warnings.push('Hidden file detected')
    }

    // Check for very small files that might be malicious
    if (file.size < 10 && matchedType !== 'documents') {
      warnings.push('File is suspiciously small')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileType: matchedType,
    config: typeConfig
  }
}
/*
*
 * Validate image file dimensions and content
 * @param {File} file - Image file to validate
 * @param {Object} config - Image type configuration
 * @returns {Promise<void>}
 */
const validateImageFile = (file, config) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      
      if (config.maxDimensions) {
        if (img.width > config.maxDimensions.width || img.height > config.maxDimensions.height) {
          reject(new Error(`Image dimensions exceed limit: ${img.width}x${img.height} > ${config.maxDimensions.width}x${config.maxDimensions.height}`))
          return
        }
      }

      // Check for minimum dimensions (prevent 1x1 tracking pixels)
      if (img.width < 10 || img.height < 10) {
        reject(new Error('Image dimensions too small (minimum 10x10 pixels)'))
        return
      }

      resolve()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Invalid or corrupted image file'))
    }

    img.src = url
  })
}

/**
 * Format file size for human reading
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate multiple files at once
 * @param {FileList|File[]} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validation results for all files
 */
export const validateFiles = async (files, options = {}) => {
  const results = {
    valid: [],
    invalid: [],
    totalSize: 0,
    errors: [],
    warnings: []
  }

  const fileArray = Array.from(files)
  
  // Check total number of files
  const maxFiles = options.maxFiles || 10
  if (fileArray.length > maxFiles) {
    results.errors.push(`Too many files selected. Maximum: ${maxFiles}`)
    return results
  }

  // Validate each file
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    const validation = await validateFile(file, options)
    
    results.totalSize += file.size

    if (validation.isValid) {
      results.valid.push({
        file,
        index: i,
        validation
      })
    } else {
      results.invalid.push({
        file,
        index: i,
        validation
      })
      results.errors.push(`File ${i + 1} (${file.name}): ${validation.errors.join(', ')}`)
    }

    if (validation.warnings.length > 0) {
      results.warnings.push(`File ${i + 1} (${file.name}): ${validation.warnings.join(', ')}`)
    }
  }

  // Check total size limit
  const maxTotalSize = options.maxTotalSize || 500 * 1024 * 1024 // 500MB default
  if (results.totalSize > maxTotalSize) {
    results.errors.push(`Total file size exceeds limit: ${formatFileSize(results.totalSize)} > ${formatFileSize(maxTotalSize)}`)
  }

  return results
}

/**
 * Create a secure file reader with validation
 * @param {File} file - File to read
 * @param {Object} options - Reading options
 * @returns {Promise<string|ArrayBuffer>} - File content
 */
export const secureFileReader = (file, options = {}) => {
  return new Promise(async (resolve, reject) => {
    // Validate file first
    const validation = await validateFile(file, options.validation || {})
    if (!validation.isValid) {
      reject(new Error(`File validation failed: ${validation.errors.join(', ')}`))
      return
    }

    const reader = new FileReader()
    const { readAs = 'text', encoding = 'UTF-8' } = options

    reader.onload = (event) => {
      resolve(event.target.result)
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    // Set timeout for reading
    const timeout = options.timeout || 30000 // 30 seconds
    const timeoutId = setTimeout(() => {
      reader.abort()
      reject(new Error('File reading timeout'))
    }, timeout)

    reader.onloadend = () => {
      clearTimeout(timeoutId)
    }

    // Read file based on type
    switch (readAs) {
      case 'text':
        reader.readAsText(file, encoding)
        break
      case 'dataURL':
        reader.readAsDataURL(file)
        break
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break
      case 'binaryString':
        reader.readAsBinaryString(file)
        break
      default:
        reject(new Error(`Invalid readAs option: ${readAs}`))
    }
  })
}

/**
 * Generate secure filename for storage
 * @param {string} originalName - Original filename
 * @param {Object} options - Generation options
 * @returns {string} - Secure filename
 */
export const generateSecureFilename = (originalName, options = {}) => {
  const {
    addTimestamp = true,
    addRandomSuffix = true,
    preserveExtension = true,
    maxLength = 100
  } = options

  let name = originalName || 'file'
  let extension = ''

  // Extract extension
  if (preserveExtension) {
    const lastDot = name.lastIndexOf('.')
    if (lastDot > 0) {
      extension = name.substring(lastDot)
      name = name.substring(0, lastDot)
    }
  }

  // Sanitize base name
  name = name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')

  if (!name) {
    name = 'file'
  }

  // Add timestamp
  if (addTimestamp) {
    const timestamp = Date.now()
    name = `${name}_${timestamp}`
  }

  // Add random suffix
  if (addRandomSuffix) {
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    name = `${name}_${randomSuffix}`
  }

  // Combine with extension
  let finalName = name + extension

  // Ensure length limit
  if (finalName.length > maxLength) {
    const availableLength = maxLength - extension.length
    name = name.substring(0, availableLength)
    finalName = name + extension
  }

  return finalName
}

/**
 * Check if file content matches its declared MIME type
 * @param {File} file - File to check
 * @returns {Promise<boolean>} - True if content matches MIME type
 */
export const validateMimeType = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const arrayBuffer = event.target.result
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Check file signatures (magic numbers)
      const signatures = {
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
        'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
        'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
        'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]]
      }

      const declaredType = file.type
      const typeSignatures = signatures[declaredType]

      if (!typeSignatures) {
        // If we don't have signature data, assume it's valid
        resolve(true)
        return
      }

      // Check if any signature matches
      const matches = typeSignatures.some(signature => {
        return signature.every((byte, index) => uint8Array[index] === byte)
      })

      resolve(matches)
    }

    reader.onerror = () => {
      resolve(false)
    }

    // Only read first 32 bytes for signature checking
    const blob = file.slice(0, 32)
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * Scan file for potential malware patterns (basic client-side detection)
 * @param {File} file - File to scan
 * @returns {Promise<{isSafe: boolean, threats: string[]}>}
 */
export const basicMalwareScan = async (file) => {
  const threats = []
  
  try {
    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.exe\./i,
      /\.scr\./i,
      /\.bat\./i,
      /\.cmd\./i,
      /\.com\./i,
      /\.pif\./i,
      /autorun\.inf/i,
      /desktop\.ini/i
    ]

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(file.name)) {
        threats.push(`Suspicious filename pattern: ${pattern}`)
      }
    })

    // For text files, scan content for suspicious patterns
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const content = await secureFileReader(file, { readAs: 'text' })
      
      const maliciousPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /eval\s*\(/i,
        /document\.write/i
      ]

      maliciousPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          threats.push(`Suspicious content pattern detected`)
        }
      })
    }

    return {
      isSafe: threats.length === 0,
      threats
    }
  } catch (error) {
    return {
      isSafe: false,
      threats: [`Scan failed: ${error.message}`]
    }
  }
}

/**
 * Create a comprehensive file validation pipeline
 * @param {Object} config - Pipeline configuration
 * @returns {Function} - Validation pipeline function
 */
export const createValidationPipeline = (config = {}) => {
  const {
    enableMimeValidation = true,
    enableMalwareScan = true,
    enableContentScan = true,
    customValidators = []
  } = config

  return async (file, options = {}) => {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {}
    }

    try {
      // Basic file validation
      const basicValidation = await validateFile(file, options)
      results.details.basic = basicValidation
      
      if (!basicValidation.isValid) {
        results.isValid = false
        results.errors.push(...basicValidation.errors)
      }
      results.warnings.push(...basicValidation.warnings)

      // MIME type validation
      if (enableMimeValidation && results.isValid) {
        const mimeValid = await validateMimeType(file)
        results.details.mimeType = { valid: mimeValid }
        
        if (!mimeValid) {
          results.isValid = false
          results.errors.push('File content does not match declared MIME type')
        }
      }

      // Malware scan
      if (enableMalwareScan && results.isValid) {
        const scanResult = await basicMalwareScan(file)
        results.details.malwareScan = scanResult
        
        if (!scanResult.isSafe) {
          results.isValid = false
          results.errors.push(...scanResult.threats)
        }
      }

      // Custom validators
      for (const validator of customValidators) {
        if (typeof validator === 'function') {
          try {
            const customResult = await validator(file, options)
            if (customResult && !customResult.isValid) {
              results.isValid = false
              results.errors.push(...(customResult.errors || ['Custom validation failed']))
            }
          } catch (error) {
            results.warnings.push(`Custom validator error: ${error.message}`)
          }
        }
      }

    } catch (error) {
      results.isValid = false
      results.errors.push(`Validation pipeline error: ${error.message}`)
    }

    return results
  }
}

export default {
  validateFile,
  validateFiles,
  secureFileReader,
  generateSecureFilename,
  validateMimeType,
  basicMalwareScan,
  createValidationPipeline,
  FILE_TYPES
}