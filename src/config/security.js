/**
 * Security configuration for the ticket management portal
 * Centralized security settings and policies
 */

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // Authentication attempts
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // API requests
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'API rate limit exceeded. Please slow down.'
  },
  
  // File uploads
  upload: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Upload rate limit exceeded. Please wait before uploading more files.'
  },
  
  // Search requests
  search: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    message: 'Search rate limit exceeded. Please wait before searching again.'
  },
  
  // Password reset attempts
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset attempts. Please try again later.'
  }
}

/**
 * Input sanitization configuration
 */
export const SANITIZATION_CONFIG = {
  // HTML content (rich text editor)
  html: {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'a', 'img'
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height', 'title'],
      'code': ['class'],
      'pre': ['class']
    },
    allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:']
  },
  
  // Text input
  text: {
    maxLength: 10000,
    allowNewlines: true,
    trimWhitespace: true
  },
  
  // Email input
  email: {
    maxLength: 254, // RFC 5321 limit
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // URL input
  url: {
    allowedProtocols: ['http:', 'https:'],
    maxLength: 2048
  }
}

/**
 * File upload security configuration
 */
export const FILE_UPLOAD_CONFIG = {
  // Maximum file sizes (in bytes)
  maxFileSizes: {
    image: 10 * 1024 * 1024,    // 10MB
    video: 100 * 1024 * 1024,   // 100MB
    document: 25 * 1024 * 1024, // 25MB
    audio: 50 * 1024 * 1024     // 50MB
  },
  
  // Maximum total upload size per request
  maxTotalSize: 200 * 1024 * 1024, // 200MB
  
  // Maximum number of files per upload
  maxFiles: 10,
  
  // Allowed file types
  allowedTypes: {
    images: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
      mimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 
        'image/webp', 'image/bmp'
      ]
    },
    videos: {
      extensions: ['.mp4', '.avi', '.mov', '.wmv', '.webm'],
      mimeTypes: [
        'video/mp4', 'video/avi', 'video/quicktime',
        'video/x-ms-wmv', 'video/webm'
      ]
    },
    documents: {
      extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      mimeTypes: [
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/rtf'
      ]
    },
    audio: {
      extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac'],
      mimeTypes: [
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'audio/mp4', 'audio/aac'
      ]
    }
  },
  
  // Dangerous file types (never allow)
  dangerousExtensions: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.run',
    '.bin', '.sh', '.ps1', '.php', '.asp', '.aspx', '.jsp', '.py',
    '.rb', '.pl', '.htaccess', '.htpasswd', '.web.config'
  ],
  
  // Image dimension limits
  maxImageDimensions: {
    width: 4000,
    height: 4000
  },
  
  // Video duration limit (seconds)
  maxVideoDuration: 600, // 10 minutes
  
  // Audio duration limit (seconds)
  maxAudioDuration: 1800 // 30 minutes
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Note: Should be removed in production
      "'unsafe-eval'",   // Note: Should be removed in production
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'media-src': [
      "'self'",
      'blob:',
      'data:'
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': []
  }
}

/**
 * Session security configuration
 */
export const SESSION_CONFIG = {
  // Session timeout (milliseconds)
  timeout: 8 * 60 * 60 * 1000, // 8 hours
  
  // Session refresh threshold (milliseconds before expiry)
  refreshThreshold: 5 * 60 * 1000, // 5 minutes
  
  // Maximum concurrent sessions per user
  maxConcurrentSessions: 3,
  
  // Session cookie settings
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict'
  }
}

/**
 * Password policy configuration
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  
  // Password history (prevent reuse)
  historyCount: 5,
  
  // Password expiry (days)
  expiryDays: 90,
  
  // Account lockout after failed attempts
  maxFailedAttempts: 5,
  lockoutDuration: 30 * 60 * 1000 // 30 minutes
}

/**
 * Suspicious activity detection configuration
 */
export const SUSPICIOUS_ACTIVITY_CONFIG = {
  // Thresholds for different activities
  thresholds: {
    login_attempts: {
      count: 5,
      timeWindow: 15 * 60 * 1000 // 15 minutes
    },
    ticket_creation: {
      count: 10,
      timeWindow: 60 * 60 * 1000 // 1 hour
    },
    file_uploads: {
      count: 20,
      timeWindow: 60 * 60 * 1000 // 1 hour
    },
    search_requests: {
      count: 100,
      timeWindow: 60 * 60 * 1000 // 1 hour
    },
    password_reset: {
      count: 3,
      timeWindow: 60 * 60 * 1000 // 1 hour
    }
  },
  
  // Actions to take when suspicious activity is detected
  actions: {
    log: true,
    notify: true,
    temporaryBlock: false, // Set to true to enable temporary blocking
    requireAdditionalAuth: false
  }
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

/**
 * Input validation rules for different form fields
 */
export const VALIDATION_RULES = {
  // Ticket creation
  ticket: {
    titulo: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/
    },
    descripcion: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 10000
    },
    prioridad: {
      required: true,
      type: 'string',
      enum: ['baja', 'media', 'alta', 'urgente']
    },
    tipo_ticket_id: {
      required: true,
      type: 'string',
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    }
  },
  
  // User authentication
  auth: {
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    }
  },
  
  // Comment creation
  comment: {
    contenido: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 5000
    }
  },
  
  // Search queries
  search: {
    query: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 500,
      pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/
    }
  }
}

/**
 * Security event types for logging
 */
export const SECURITY_EVENT_TYPES = {
  // Authentication events
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  AUTH_RATE_LIMIT: 'auth_rate_limit_exceeded',
  PASSWORD_RESET: 'password_reset_requested',
  SESSION_EXPIRED: 'session_expired',
  
  // Input validation events
  INPUT_VALIDATION_FAILED: 'input_validation_failed',
  XSS_ATTEMPT: 'xss_attempt_detected',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  
  // File upload events
  FILE_UPLOAD_SUCCESS: 'file_upload_success',
  FILE_UPLOAD_FAILED: 'file_upload_failed',
  MALICIOUS_FILE_DETECTED: 'malicious_file_detected',
  FILE_SIZE_EXCEEDED: 'file_size_exceeded',
  
  // Suspicious activity events
  SUSPICIOUS_ACTIVITY: 'suspicious_activity_detected',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  MULTIPLE_FAILED_LOGINS: 'multiple_failed_logins',
  
  // System events
  SECURITY_ERROR: 'security_error',
  CONFIGURATION_CHANGED: 'security_configuration_changed'
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG = {
  rateLimits: RATE_LIMITS,
  sanitization: SANITIZATION_CONFIG,
  fileUpload: FILE_UPLOAD_CONFIG,
  csp: CSP_CONFIG,
  session: SESSION_CONFIG,
  passwordPolicy: PASSWORD_POLICY,
  suspiciousActivity: SUSPICIOUS_ACTIVITY_CONFIG,
  securityHeaders: SECURITY_HEADERS,
  validationRules: VALIDATION_RULES,
  eventTypes: SECURITY_EVENT_TYPES
}

export default DEFAULT_SECURITY_CONFIG