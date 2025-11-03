// User roles
export const USER_ROLES = {
  CLIENTE: 'cliente',
  TECNICO: 'tecnico',
  ADMIN: 'admin'
}

// Ticket states
export const TICKET_STATES = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  vobo: 'VoBo',
  cerrado: 'Cerrado'
}

// Ticket priorities
export const TICKET_PRIORITIES = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
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

// Priority labels and colors
export const PRIORITY_CONFIG = {
  baja: { label: 'Baja', color: 'bg-gray-100 text-gray-800', badgeColor: 'gray' },
  media: { label: 'Media', color: 'bg-blue-100 text-blue-800', badgeColor: 'blue' },
  alta: { label: 'Alta', color: 'bg-yellow-100 text-yellow-800', badgeColor: 'yellow' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800', badgeColor: 'red' }
}

// State labels and colors
export const STATE_CONFIG = {
  abierto: { label: 'Abierto', color: 'bg-green-100 text-green-800', badgeColor: 'green' },
  en_progreso: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800', badgeColor: 'blue' },
  vobo: { label: 'VoBo', color: 'bg-yellow-100 text-yellow-800', badgeColor: 'yellow' },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800', badgeColor: 'gray' }
}

// Role labels
export const ROLE_LABELS = {
  cliente: 'Cliente',
  tecnico: 'Técnico',
  admin: 'Administrador'
}

// Valid state transitions
export const STATE_TRANSITIONS = {
  abierto: ['en_progreso'],
  en_progreso: ['vobo', 'abierto'],
  vobo: ['cerrado', 'en_progreso'],
  cerrado: ['abierto'] // Only admins
}

// API endpoints and configuration
export const API_CONFIG = {
  PAGINATION_LIMIT: 20,
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
}