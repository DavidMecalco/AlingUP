import { isValidEmail } from './helpers'
import { API_CONFIG } from './constants'

/**
 * Validate login form data
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation result with errors
 */
export const validateLoginForm = (data) => {
  const errors = {}
  
  if (!data.email) {
    errors.email = 'El email es requerido'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El formato del email no es válido'
  }
  
  if (!data.password) {
    errors.password = 'La contraseña es requerida'
  } else if (data.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate ticket form data
 * @param {Object} data - Ticket form data to validate
 * @returns {Object} Validation result with errors
 */
export const validateTicketForm = (data) => {
  const errors = {}
  
  if (!data.titulo || data.titulo.trim().length === 0) {
    errors.titulo = 'El título es requerido'
  } else if (data.titulo.trim().length < 5) {
    errors.titulo = 'El título debe tener al menos 5 caracteres'
  }
  
  if (!data.descripcion || data.descripcion.trim().length === 0) {
    errors.descripcion = 'La descripción es requerida'
  } else if (data.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
  }
  
  if (!data.prioridad) {
    errors.prioridad = 'La prioridad es requerida'
  }
  
  if (!data.tipo_ticket_id) {
    errors.tipo_ticket_id = 'El tipo de ticket es requerido'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {string} type - Expected file type category
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, type) => {
  const errors = []
  
  // Check file size
  if (file.size > API_CONFIG.FILE_SIZE_LIMIT) {
    errors.push(`El archivo es demasiado grande. Máximo ${API_CONFIG.FILE_SIZE_LIMIT / (1024 * 1024)}MB`)
  }
  
  // Check file type
  let allowedTypes = []
  switch (type) {
    case 'image':
      allowedTypes = API_CONFIG.ALLOWED_IMAGE_TYPES
      break
    case 'video':
      allowedTypes = API_CONFIG.ALLOWED_VIDEO_TYPES
      break
    case 'document':
      allowedTypes = API_CONFIG.ALLOWED_DOCUMENT_TYPES
      break
    default:
      allowedTypes = [
        ...API_CONFIG.ALLOWED_IMAGE_TYPES,
        ...API_CONFIG.ALLOWED_VIDEO_TYPES,
        ...API_CONFIG.ALLOWED_DOCUMENT_TYPES
      ]
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de archivo no permitido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate comment form data
 * @param {Object} data - Comment form data
 * @returns {Object} Validation result
 */
export const validateCommentForm = (data) => {
  const errors = {}
  
  if (!data.contenido || data.contenido.trim().length === 0) {
    errors.contenido = 'El comentario no puede estar vacío'
  } else if (data.contenido.trim().length < 3) {
    errors.contenido = 'El comentario debe tener al menos 3 caracteres'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate ticket creation form data
 * @param {Object} data - Ticket form data
 * @returns {Object} Validation result
 */
export const validateCreateTicketForm = (data) => {
  const errors = {}
  
  if (!data.titulo || data.titulo.trim().length === 0) {
    errors.titulo = 'El título es requerido'
  } else if (data.titulo.trim().length < 5) {
    errors.titulo = 'El título debe tener al menos 5 caracteres'
  } else if (data.titulo.trim().length > 200) {
    errors.titulo = 'El título no puede exceder 200 caracteres'
  }
  
  if (!data.descripcion || data.descripcion.trim().length === 0) {
    errors.descripcion = 'La descripción es requerida'
  } else if (data.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
  } else if (data.descripcion.trim().length > 2000) {
    errors.descripcion = 'La descripción no puede exceder 2000 caracteres'
  }
  
  if (!data.prioridad) {
    errors.prioridad = 'La prioridad es requerida'
  } else if (!['baja', 'media', 'alta', 'urgente'].includes(data.prioridad)) {
    errors.prioridad = 'Prioridad inválida'
  }
  
  if (!data.tipo_ticket_id) {
    errors.tipo_ticket_id = 'El tipo de ticket es requerido'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate ticket update form data
 * @param {Object} data - Ticket update data
 * @returns {Object} Validation result
 */
export const validateUpdateTicketForm = (data) => {
  const errors = {}
  
  if (data.titulo !== undefined) {
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.titulo = 'El título es requerido'
    } else if (data.titulo.trim().length < 5) {
      errors.titulo = 'El título debe tener al menos 5 caracteres'
    } else if (data.titulo.trim().length > 200) {
      errors.titulo = 'El título no puede exceder 200 caracteres'
    }
  }
  
  if (data.descripcion !== undefined) {
    if (!data.descripcion || data.descripcion.trim().length === 0) {
      errors.descripcion = 'La descripción es requerida'
    } else if (data.descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
    } else if (data.descripcion.trim().length > 2000) {
      errors.descripcion = 'La descripción no puede exceder 2000 caracteres'
    }
  }
  
  if (data.prioridad !== undefined) {
    if (!data.prioridad) {
      errors.prioridad = 'La prioridad es requerida'
    } else if (!['baja', 'media', 'alta', 'urgente'].includes(data.prioridad)) {
      errors.prioridad = 'Prioridad inválida'
    }
  }
  
  if (data.estado !== undefined) {
    if (!['abierto', 'en_progreso', 'vobo', 'cerrado'].includes(data.estado)) {
      errors.estado = 'Estado inválido'
    }
  }
  
  if (data.tipo_ticket_id !== undefined && !data.tipo_ticket_id) {
    errors.tipo_ticket_id = 'El tipo de ticket es requerido'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate ticket state transition
 * @param {string} currentState - Current ticket state
 * @param {string} newState - New ticket state
 * @param {string} userRole - User role making the change
 * @returns {Object} Validation result
 */
export const validateStateTransition = (currentState, newState, userRole) => {
  const errors = []
  
  // Define valid transitions
  const validTransitions = {
    'abierto': ['en_progreso'],
    'en_progreso': ['vobo', 'abierto'],
    'vobo': ['cerrado', 'en_progreso'],
    'cerrado': ['abierto'] // Only admins can reopen
  }
  
  // Check if transition is valid
  if (!validTransitions[currentState]?.includes(newState)) {
    errors.push(`No se puede cambiar de ${currentState} a ${newState}`)
  }
  
  // Check role permissions
  if (newState === 'cerrado' && userRole === 'cliente') {
    errors.push('Solo técnicos y administradores pueden cerrar tickets')
  }
  
  if (currentState === 'cerrado' && newState === 'abierto' && userRole !== 'admin') {
    errors.push('Solo administradores pueden reabrir tickets cerrados')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize HTML input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input) return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}