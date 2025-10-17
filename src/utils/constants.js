// User roles
export const USER_ROLES = {
  CLIENTE: 'cliente',
  TECNICO: 'tecnico',
  ADMIN: 'admin'
}

// Ticket states
export const TICKET_STATES = {
  ABIERTO: 'abierto',
  EN_PROGRESO: 'en_progreso',
  VOBO: 'vobo',
  CERRADO: 'cerrado'
}

// Ticket priorities
export const TICKET_PRIORITIES = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
}

// Attachment types
export const ATTACHMENT_TYPES = {
  FOTO: 'foto',
  VIDEO: 'video',
  DOCUMENTO: 'documento',
  NOTA_VOZ: 'nota_voz'
}

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TICKETS: '/tickets',
  TICKET_DETAIL: '/tickets/:id',
  ADMIN: '/admin'
}

// API endpoints and configuration
export const API_CONFIG = {
  PAGINATION_LIMIT: 20,
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
}