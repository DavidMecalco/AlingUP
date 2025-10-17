/**
 * Format date to a readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "hace 2 horas")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const dateObj = new Date(date)
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  if (diffInSeconds < 60) return 'hace unos segundos'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(date)
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get priority configuration
 * @param {string} priority - Priority value
 * @returns {Object} Priority configuration
 */
export const getPriorityConfig = (priority) => {
  const { PRIORITY_CONFIG } = require('./constants')
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.media
}

/**
 * Get state configuration
 * @param {string} state - State value
 * @returns {Object} State configuration
 */
export const getStateConfig = (state) => {
  const { STATE_CONFIG } = require('./constants')
  return STATE_CONFIG[state] || STATE_CONFIG.abierto
}

/**
 * Get role label
 * @param {string} role - Role value
 * @returns {string} Role label
 */
export const getRoleLabel = (role) => {
  const { ROLE_LABELS } = require('./constants')
  return ROLE_LABELS[role] || role
}

/**
 * Check if state transition is valid
 * @param {string} currentState - Current state
 * @param {string} newState - New state
 * @returns {boolean} True if transition is valid
 */
export const isValidStateTransition = (currentState, newState) => {
  const { STATE_TRANSITIONS } = require('./constants')
  return STATE_TRANSITIONS[currentState]?.includes(newState) || false
}

/**
 * Get available next states for a ticket
 * @param {string} currentState - Current ticket state
 * @param {string} userRole - User role
 * @returns {string[]} Available next states
 */
export const getAvailableStates = (currentState, userRole) => {
  const { STATE_TRANSITIONS } = require('./constants')
  let availableStates = STATE_TRANSITIONS[currentState] || []
  
  // Filter based on user role
  if (userRole === 'cliente') {
    // Clients can't close tickets or reopen closed ones
    availableStates = availableStates.filter(state => 
      state !== 'cerrado' && !(currentState === 'cerrado' && state === 'abierto')
    )
  }
  
  if (userRole !== 'admin' && currentState === 'cerrado') {
    // Only admins can reopen closed tickets
    availableStates = []
  }
  
  return availableStates
}

/**
 * Format ticket ID for display
 * @param {string} ticketId - Full ticket UUID
 * @returns {string} Formatted ticket ID
 */
export const formatTicketId = (ticketId) => {
  if (!ticketId) return ''
  return `#${ticketId.slice(-8).toUpperCase()}`
}

/**
 * Calculate time since ticket creation
 * @param {string|Date} createdAt - Creation date
 * @returns {string} Time since creation
 */
export const getTicketAge = (createdAt) => {
  if (!createdAt) return ''
  
  const now = new Date()
  const created = new Date(createdAt)
  const diffInHours = Math.floor((now - created) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Hace menos de 1 hora'
  if (diffInHours < 24) return `Hace ${diffInHours} horas`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `Hace ${diffInWeeks} semanas`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `Hace ${diffInMonths} meses`
}

/**
 * Sort tickets by priority (urgente first)
 * @param {Array} tickets - Array of tickets
 * @returns {Array} Sorted tickets
 */
export const sortTicketsByPriority = (tickets) => {
  const priorityOrder = { urgente: 4, alta: 3, media: 2, baja: 1 }
  
  return [...tickets].sort((a, b) => {
    const priorityA = priorityOrder[a.prioridad] || 0
    const priorityB = priorityOrder[b.prioridad] || 0
    return priorityB - priorityA
  })
}

/**
 * Filter tickets by search term
 * @param {Array} tickets - Array of tickets
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered tickets
 */
export const filterTicketsBySearch = (tickets, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return tickets
  
  const term = searchTerm.toLowerCase().trim()
  
  return tickets.filter(ticket => 
    ticket.titulo.toLowerCase().includes(term) ||
    ticket.descripcion.toLowerCase().includes(term) ||
    ticket.cliente?.nombre_completo?.toLowerCase().includes(term) ||
    ticket.tecnico?.nombre_completo?.toLowerCase().includes(term) ||
    formatTicketId(ticket.id).toLowerCase().includes(term)
  )
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}