/**
 * Type definitions for the ticket management system
 * Using JSDoc for type annotations since we're using JavaScript
 */

/**
 * @typedef {'cliente' | 'tecnico' | 'admin'} UserRole
 */

/**
 * @typedef {'abierto' | 'en_progreso' | 'vobo' | 'cerrado'} TicketEstado
 */

/**
 * @typedef {'baja' | 'media' | 'alta' | 'urgente'} TicketPrioridad
 */

/**
 * @typedef {'foto' | 'video' | 'documento' | 'nota_voz'} AttachmentTipo
 */

/**
 * @typedef {Object} User
 * @property {string} id - User UUID
 * @property {string} email - User email
 * @property {string} nombre_completo - Full name
 * @property {UserRole} rol - User role
 * @property {string} [empresa_cliente] - Client company name
 * @property {boolean} estado - User active status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 */

/**
 * @typedef {Object} TicketType
 * @property {string} id - Ticket type UUID
 * @property {string} nombre - Type name
 * @property {string} [descripcion] - Type description
 * @property {string} color - Hex color for UI
 * @property {boolean} activo - Active status
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Ticket
 * @property {string} id - Ticket UUID
 * @property {string} titulo - Ticket title
 * @property {string} descripcion - Ticket description
 * @property {string} cliente_id - Client user ID
 * @property {string} [tecnico_id] - Assigned technician ID
 * @property {TicketEstado} estado - Ticket state
 * @property {TicketPrioridad} prioridad - Ticket priority
 * @property {string} tipo_ticket_id - Ticket type ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 * @property {string} [closed_at] - Closure timestamp
 * @property {User} [cliente] - Client user object (joined)
 * @property {User} [tecnico] - Technician user object (joined)
 * @property {TicketType} [tipo_ticket] - Ticket type object (joined)
 */

/**
 * @typedef {Object} TicketAttachment
 * @property {string} id - Attachment UUID
 * @property {string} ticket_id - Ticket ID
 * @property {AttachmentTipo} tipo - Attachment type
 * @property {string} url_storage - Supabase Storage URL
 * @property {string} nombre_archivo - Original filename
 * @property {number} [tamaño_archivo] - File size in bytes
 * @property {string} [mime_type] - MIME type
 * @property {string} uploaded_by - Uploader user ID
 * @property {string} created_at - Upload timestamp
 * @property {User} [uploader] - Uploader user object (joined)
 */

/**
 * @typedef {Object} TicketComment
 * @property {string} id - Comment UUID
 * @property {string} ticket_id - Ticket ID
 * @property {string} user_id - Comment author ID
 * @property {string} contenido - Comment content
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 * @property {User} [user] - Comment author object (joined)
 */

/**
 * @typedef {Object} TicketTimeline
 * @property {string} id - Timeline entry UUID
 * @property {string} ticket_id - Ticket ID
 * @property {string} [user_id] - User who triggered the event
 * @property {string} evento_tipo - Event type
 * @property {string} descripcion - Event description
 * @property {Object} [datos_adicionales] - Additional event data
 * @property {string} created_at - Event timestamp
 * @property {User} [user] - User object (joined)
 */

/**
 * @typedef {Object} CreateTicketData
 * @property {string} titulo - Ticket title
 * @property {string} descripcion - Ticket description
 * @property {TicketPrioridad} prioridad - Ticket priority
 * @property {string} tipo_ticket_id - Ticket type ID
 */

/**
 * @typedef {Object} UpdateTicketData
 * @property {string} [titulo] - Ticket title
 * @property {string} [descripcion] - Ticket description
 * @property {TicketPrioridad} [prioridad] - Ticket priority
 * @property {string} [tipo_ticket_id] - Ticket type ID
 * @property {TicketEstado} [estado] - Ticket state
 * @property {string} [tecnico_id] - Assigned technician ID
 */

/**
 * @typedef {Object} TicketFilters
 * @property {TicketEstado[]} [estados] - Filter by states
 * @property {TicketPrioridad[]} [prioridades] - Filter by priorities
 * @property {string[]} [tipos] - Filter by type IDs
 * @property {string[]} [tecnicos] - Filter by technician IDs
 * @property {string[]} [clientes] - Filter by client IDs
 * @property {string} [search] - Search term
 * @property {Date} [fecha_desde] - Date range start
 * @property {Date} [fecha_hasta] - Date range end
 */

/**
 * @typedef {Object} PaginationOptions
 * @property {number} [page] - Page number (1-based)
 * @property {number} [limit] - Items per page
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortOrder] - Sort order
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {any[]} data - Response data
 * @property {number} count - Total count
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total pages
 * @property {boolean} hasMore - Has more pages
 */

export {}