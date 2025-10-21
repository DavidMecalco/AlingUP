import { supabase } from './supabaseClient'
import securityService from './securityService.js'

/**
 * Service for managing tickets with CRUD operations
 */
class TicketService {
  /**
   * Get all tickets with optional filtering and pagination
   * @param {import('../types/index.js').TicketFilters} filters - Filter options
   * @param {import('../types/index.js').PaginationOptions} pagination - Pagination options
   * @param {string} userId - User ID for rate limiting and security
   * @returns {Promise<{data: import('../types/index.js').Ticket[], error: Object|null, count: number, hasMore: boolean, nextCursor?: string}>}
   */
  async getTickets(filters = {}, pagination = {}, userId = 'anonymous') {
    try {
      // Apply rate limiting
      const rateLimitResult = securityService.checkRateLimit('api', userId)
      if (!rateLimitResult.allowed) {
        return { 
          data: [], 
          error: { message: 'Rate limit exceeded. Please try again later.' }, 
          count: 0, 
          hasMore: false 
        }
      }

      // Sanitize search input
      const sanitizedFilters = { ...filters }
      if (sanitizedFilters.search) {
        sanitizedFilters.search = securityService.sanitizeInput(sanitizedFilters.search, 'text', {
          maxLength: 500,
          allowNewlines: false
        })
      }
      const { 
        estados, 
        prioridades, 
        tipos, 
        tecnicos, 
        clientes, 
        search, 
        fecha_desde, 
        fecha_hasta 
      } = sanitizedFilters

      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'created_at', 
        sortOrder = 'desc',
        cursor = null,
        useCursor = false
      } = pagination

      let query = supabase
        .from('tickets')
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `, { count: 'exact' })

      // Apply filters
      if (estados && estados.length > 0) {
        query = query.in('estado', estados)
      }

      if (prioridades && prioridades.length > 0) {
        query = query.in('prioridad', prioridades)
      }

      if (tipos && tipos.length > 0) {
        query = query.in('tipo_ticket_id', tipos)
      }

      if (tecnicos && tecnicos.length > 0) {
        query = query.in('tecnico_id', tecnicos)
      }

      if (clientes && clientes.length > 0) {
        query = query.in('cliente_id', clientes)
      }

      if (search && search.trim()) {
        query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%,ticket_number.ilike.%${search}%`)
      }

      if (fecha_desde) {
        query = query.gte('created_at', fecha_desde.toISOString())
      }

      if (fecha_hasta) {
        query = query.lte('created_at', fecha_hasta.toISOString())
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination - cursor-based or offset-based
      if (useCursor && cursor) {
        // Cursor-based pagination for better performance with large datasets
        const operator = sortOrder === 'asc' ? 'gt' : 'lt'
        query = query[operator](sortBy, cursor)
        query = query.limit(limit + 1) // Get one extra to check if there are more
      } else {
        // Traditional offset-based pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Get tickets error:', error)
        return { data: [], error, count: 0, hasMore: false }
      }

      let hasMore = false
      let nextCursor = null
      let resultData = data || []

      if (useCursor && resultData.length > limit) {
        // Remove the extra item and set hasMore flag
        hasMore = true
        resultData = resultData.slice(0, limit)
        nextCursor = resultData[resultData.length - 1]?.[sortBy]
      } else if (!useCursor) {
        // For offset-based pagination, check if there are more pages
        const totalPages = Math.ceil((count || 0) / limit)
        hasMore = page < totalPages
      }

      return { 
        data: resultData, 
        error: null, 
        count: count || 0,
        hasMore,
        nextCursor
      }
    } catch (error) {
      console.error('Get tickets error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener tickets' }, 
        count: 0,
        hasMore: false
      }
    }
  }

  /**
   * Get a single ticket by ID
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async getTicketById(ticketId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `)
        .eq('id', ticketId)
        .single()

      if (error) {
        console.error('Get ticket by ID error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Get ticket by ID error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener ticket' } 
      }
    }
  }

  /**
   * Validate that cliente_id references a user with 'cliente' role
   * @param {string} clienteId - Client user ID to validate
   * @returns {Promise<{isValid: boolean, error: Object|null}>}
   */
  async validateClienteId(clienteId) {
    try {
      console.log('Validating cliente_id:', clienteId)
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, rol, estado, email, nombre_completo')
        .eq('id', clienteId)
        .single()

      console.log('User validation result:', { user, error })

      if (error) {
        console.error('Database error during user validation:', error)
        
        // If user not found, try to create user profile
        if (error.code === 'PGRST116') {
          console.log('User not found in users table, attempting to create profile...')
          return await this.createUserProfileIfNeeded(clienteId)
        }
        
        return { 
          isValid: false, 
          error: { message: `Error de base de datos: ${error.message}` }
        }
      }

      if (!user) {
        console.log('User not found, attempting to create profile...')
        return await this.createUserProfileIfNeeded(clienteId)
      }

      // Check if user is active
      if (!user.estado) {
        return { 
          isValid: false, 
          error: { message: 'Usuario inactivo' }
        }
      }

      // Allow cliente and admin roles to create tickets
      if (!['cliente', 'admin'].includes(user.rol)) {
        return { 
          isValid: false, 
          error: { message: `Rol no autorizado: ${user.rol}. Solo clientes y administradores pueden crear tickets` }
        }
      }
      
      console.log('User validation successful:', user)
      return { isValid: true, error: null }
    } catch (error) {
      console.error('Cliente validation error:', error)
      return { 
        isValid: false, 
        error: { message: `Error al validar usuario: ${error.message}` }
      }
    }
  }

  /**
   * Create user profile if it doesn't exist (for users authenticated via Supabase Auth)
   * @param {string} userId - User ID from Supabase Auth
   * @returns {Promise<{isValid: boolean, error: Object|null}>}
   */
  async createUserProfileIfNeeded(userId) {
    try {
      console.log('Attempting to create user profile for:', userId)
      
      // Get user info from Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        console.error('Error getting auth user:', authError)
        
        // Fallback: try to get current user session
        const { data: { user: sessionUser } } = await supabase.auth.getUser()
        
        if (!sessionUser || sessionUser.id !== userId) {
          return {
            isValid: false,
            error: { message: 'Usuario no encontrado en el sistema de autenticación' }
          }
        }
        
        // Use session user data
        const userData = {
          id: sessionUser.id,
          email: sessionUser.email,
          nombre_completo: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
          rol: 'cliente', // Default role
          estado: true
        }
        
        console.log('Creating user profile with session data:', userData)
        
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData)
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
          return {
            isValid: false,
            error: { message: `Error al crear perfil de usuario: ${insertError.message}` }
          }
        }
        
        console.log('User profile created successfully')
        return { isValid: true, error: null }
      }
      
      // Create user profile with auth data
      const userData = {
        id: authUser.user.id,
        email: authUser.user.email,
        nombre_completo: authUser.user.user_metadata?.full_name || authUser.user.email.split('@')[0],
        rol: 'cliente', // Default role
        estado: true
      }
      
      console.log('Creating user profile with auth data:', userData)
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData)
      
      if (insertError) {
        console.error('Error creating user profile:', insertError)
        return {
          isValid: false,
          error: { message: `Error al crear perfil de usuario: ${insertError.message}` }
        }
      }
      
      console.log('User profile created successfully')
      return { isValid: true, error: null }
      
    } catch (error) {
      console.error('Error in createUserProfileIfNeeded:', error)
      return {
        isValid: false,
        error: { message: `Error al crear perfil: ${error.message}` }
      }
    }
  }

  /**
   * Sanitize HTML content for rich text descriptions using security service
   * @param {string} htmlContent - HTML content to sanitize
   * @returns {string} - Sanitized HTML content
   */
  sanitizeHtmlContent(htmlContent) {
    return securityService.sanitizeInput(htmlContent, 'html', {
      allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
      allowedAttributes: {
        '*': ['class'],
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'width', 'height'],
        'code': ['class']
      }
    })
  }

  /**
   * Create a new ticket
   * @param {import('../types/index.js').CreateTicketData} ticketData - Ticket data
   * @param {string} clienteId - Client user ID
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async createTicket(ticketData, clienteId) {
    try {
      // Apply rate limiting for ticket creation
      const rateLimitResult = securityService.checkRateLimit('api', clienteId)
      if (!rateLimitResult.allowed) {
        return { 
          data: null, 
          error: { message: 'Rate limit exceeded. Please try again later.' }
        }
      }

      // Check for suspicious activity
      securityService.checkSuspiciousActivity(clienteId, 'ticket_creation', {
        titulo: ticketData.titulo,
        prioridad: ticketData.prioridad
      })

      // Validate and sanitize ticket data using security service
      const sanitizedData = securityService.validateTicketData({
        ...ticketData,
        cliente_id: clienteId
      })

      // Validate cliente_id before creating ticket
      const validation = await this.validateClienteId(clienteId)
      if (!validation.isValid) {
        return { data: null, error: validation.error }
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert(sanitizedData)
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `)
        .single()

      if (error) {
        console.error('Create ticket error:', error)
        // Check if it's the specific cliente role validation error
        if (error.message && error.message.includes('Cliente ID must reference a user with cliente role')) {
          return { 
            data: null, 
            error: { message: 'Cliente ID must reference a user with cliente role' }
          }
        }
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Create ticket error:', error)
      // Check if it's the specific cliente role validation error
      if (error.message && error.message.includes('Cliente ID must reference a user with cliente role')) {
        return { 
          data: null, 
          error: { message: 'Cliente ID must reference a user with cliente role' }
        }
      }
      return { 
        data: null, 
        error: { message: 'Error al crear ticket' } 
      }
    }
  }

  /**
   * Update an existing ticket
   * @param {string} ticketId - Ticket ID
   * @param {import('../types/index.js').UpdateTicketData} updateData - Update data
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async updateTicket(ticketId, updateData) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `)
        .single()

      if (error) {
        console.error('Update ticket error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update ticket error:', error)
      return { 
        data: null, 
        error: { message: 'Error al actualizar ticket' } 
      }
    }
  }

  /**
   * Delete a ticket (admin only)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteTicket(ticketId) {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId)

      if (error) {
        console.error('Delete ticket error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete ticket error:', error)
      return { error: { message: 'Error al eliminar ticket' } }
    }
  }

  /**
   * Assign ticket to technician
   * @param {string} ticketId - Ticket ID
   * @param {string} tecnicoId - Technician user ID (null to unassign)
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async assignTicket(ticketId, tecnicoId) {
    return this.updateTicket(ticketId, { tecnico_id: tecnicoId })
  }

  /**
   * Bulk assign multiple tickets to a technician
   * @param {Array<string>} ticketIds - Array of ticket IDs
   * @param {string} tecnicoId - Technician user ID (null to unassign)
   * @returns {Promise<{data: Array, errors: Array}>}
   */
  async bulkAssignTickets(ticketIds, tecnicoId) {
    const results = []
    const errors = []

    for (const ticketId of ticketIds) {
      try {
        const result = await this.assignTicket(ticketId, tecnicoId)
        
        if (result.error) {
          errors.push({
            ticketId,
            error: result.error
          })
        } else {
          results.push(result.data)
        }
      } catch (error) {
        errors.push({
          ticketId,
          error: { message: error.message || 'Error desconocido' }
        })
      }
    }

    return {
      data: results,
      errors: errors
    }
  }

  /**
   * Change ticket state
   * @param {string} ticketId - Ticket ID
   * @param {import('../types/index.js').TicketEstado} newState - New state
   * @param {string} [userId] - User making the change (for timeline)
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null, oldState: string|null}>}
   */
  async changeTicketState(ticketId, newState, userId = null) {
    try {
      // Get current ticket to track old state
      const currentTicket = await this.getTicketById(ticketId)
      if (currentTicket.error) {
        return { data: null, error: currentTicket.error, oldState: null }
      }

      const oldState = currentTicket.data?.estado

      const updateData = { estado: newState }
      
      // Set closed_at when closing ticket
      if (newState === 'cerrado') {
        updateData.closed_at = new Date().toISOString()
      } else if (newState !== 'cerrado') {
        updateData.closed_at = null
      }

      const result = await this.updateTicket(ticketId, updateData)
      
      return {
        ...result,
        oldState
      }
    } catch (error) {
      console.error('Change ticket state error:', error)
      return { 
        data: null, 
        error: { message: 'Error al cambiar estado del ticket' },
        oldState: null
      }
    }
  }

  /**
   * Get ticket types
   * @param {boolean} activeOnly - Only return active types
   * @returns {Promise<{data: import('../types/index.js').TicketType[], error: Object|null}>}
   */
  async getTicketTypes(activeOnly = true) {
    try {
      // First, try to get ticket types normally
      let query = supabase
        .from('ticket_types')
        .select('*')
        .order('nombre')

      if (activeOnly) {
        query = query.eq('activo', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Get ticket types error:', error)
        return { data: [], error }
      }

      // If no data found, try to seed default types
      if (!data || data.length === 0) {
        console.log('No ticket types found, attempting to seed...')
        
        // Import the seeding function dynamically to avoid circular imports
        const { getTicketTypesWithFallback } = await import('../utils/seedTicketTypes.js')
        return await getTicketTypesWithFallback()
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get ticket types error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener tipos de ticket' } 
      }
    }
  }

  /**
   * Get tickets assigned to a specific technician
   * @param {string} tecnicoId - Technician user ID
   * @param {import('../types/index.js').TicketFilters} filters - Additional filters
   * @returns {Promise<{data: import('../types/index.js').Ticket[], error: Object|null}>}
   */
  async getTicketsByTechnician(tecnicoId, filters = {}) {
    const technicianFilters = {
      ...filters,
      tecnicos: [tecnicoId]
    }
    
    const result = await this.getTickets(technicianFilters)
    return { data: result.data, error: result.error }
  }

  /**
   * Get tickets created by a specific client
   * @param {string} clienteId - Client user ID
   * @param {import('../types/index.js').TicketFilters} filters - Additional filters
   * @returns {Promise<{data: import('../types/index.js').Ticket[], error: Object|null}>}
   */
  async getTicketsByClient(clienteId, filters = {}) {
    const clientFilters = {
      ...filters,
      clientes: [clienteId]
    }
    
    const result = await this.getTickets(clientFilters)
    return { data: result.data, error: result.error }
  }

  /**
   * Get ticket statistics
   * @param {import('../types/index.js').TicketFilters} filters - Filter options
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getTicketStats(filters = {}) {
    try {
      // Get total counts by state
      const { data: stateStats, error: stateError } = await supabase
        .from('tickets')
        .select('estado')
        .then(({ data, error }) => {
          if (error) return { data: null, error }
          
          const stats = data.reduce((acc, ticket) => {
            acc[ticket.estado] = (acc[ticket.estado] || 0) + 1
            return acc
          }, {})
          
          return { data: stats, error: null }
        })

      if (stateError) {
        return { data: null, error: stateError }
      }

      // Get total counts by priority
      const { data: priorityStats, error: priorityError } = await supabase
        .from('tickets')
        .select('prioridad')
        .then(({ data, error }) => {
          if (error) return { data: null, error }
          
          const stats = data.reduce((acc, ticket) => {
            acc[ticket.prioridad] = (acc[ticket.prioridad] || 0) + 1
            return acc
          }, {})
          
          return { data: stats, error: null }
        })

      if (priorityError) {
        return { data: null, error: priorityError }
      }

      return {
        data: {
          byState: stateStats,
          byPriority: priorityStats,
          total: Object.values(stateStats).reduce((sum, count) => sum + count, 0)
        },
        error: null
      }
    } catch (error) {
      console.error('Get ticket stats error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener estadísticas' } 
      }
    }
  }
}

// Create and export singleton instance
const ticketService = new TicketService()
export default ticketService