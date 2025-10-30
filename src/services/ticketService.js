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
      console.log('🔍 Validating cliente_id:', clienteId)
      
      // Quick check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('id, rol, estado, email, nombre_completo')
        .eq('id', clienteId)
        .single()

      console.log('📊 User query result:', { user, error })

      // If user exists, validate their status and role
      if (user) {
        // Check if user is active (estado should be true or null, not false)
        if (user.estado === false) {
          console.log('❌ User is inactive')
          return { 
            isValid: false, 
            error: { message: 'Usuario inactivo' }
          }
        }
        
        // Check if user has valid role
        if (!['cliente', 'admin', 'tecnico'].includes(user.rol)) {
          console.log('❌ Invalid user role:', user.rol)
          return { 
            isValid: false, 
            error: { message: `Rol no autorizado: ${user.rol}` }
          }
        }
        
        console.log('✅ User validation successful:', user)
        return { isValid: true, error: null }
      }

      // If user doesn't exist (PGRST116 = no rows returned)
      if (error && error.code === 'PGRST116') {
        console.log('👤 User not found, will attempt to create profile...')
        return await this.createUserProfileIfNeeded(clienteId)
      }

      // Other database errors
      if (error) {
        console.error('❌ Database error during user validation:', error)
        return { 
          isValid: false, 
          error: { message: `Error de base de datos: ${error.message}` }
        }
      }

      // Fallback
      console.log('❌ Unknown validation error')
      return { 
        isValid: false, 
        error: { message: 'Error desconocido en validación de usuario' }
      }
    } catch (error) {
      console.error('❌ Cliente validation error:', error)
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
      console.log('🚀 Creating user profile for:', userId)
      
      // Get current user session
      const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError || !sessionUser) {
        console.error('❌ Error getting session user:', sessionError)
        return {
          isValid: false,
          error: { message: 'No se pudo obtener información del usuario autenticado' }
        }
      }
      
      if (sessionUser.id !== userId) {
        console.error('❌ Session user ID mismatch')
        return {
          isValid: false,
          error: { message: 'ID de usuario no coincide con la sesión actual' }
        }
      }
      
      // Prepare user data
      const userData = {
        id: sessionUser.id,
        email: sessionUser.email,
        nombre_completo: sessionUser.user_metadata?.full_name || 
                        sessionUser.user_metadata?.name || 
                        sessionUser.email.split('@')[0],
        rol: 'cliente',
        estado: true
      }
      
      console.log('📝 Creating user profile with data:', userData)
      
      // Try to insert user profile
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select('id, rol, estado')
        .single()
      
      if (insertError) {
        console.error('❌ Error creating user profile:', insertError)
        
        // If user already exists, that's fine
        if (insertError.code === '23505') {
          console.log('👤 User already exists, validating...')
          
          // Quick validation of existing user
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, rol, estado')
            .eq('id', userId)
            .single()
          
          if (!checkError && existingUser && existingUser.estado && ['cliente', 'admin'].includes(existingUser.rol)) {
            console.log('✅ Existing user is valid:', existingUser)
            return { isValid: true, error: null }
          }
        }
        
        return {
          isValid: false,
          error: { message: `Error al crear perfil: ${insertError.message}` }
        }
      }
      
      console.log('✅ User profile created successfully:', insertedUser)
      return { isValid: true, error: null }
      
    } catch (error) {
      console.error('❌ Error in createUserProfileIfNeeded:', error)
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
      console.log('Creating ticket with data:', ticketData, 'for client:', clienteId)

      // FIRST: Ensure user profile exists before attempting to create ticket
      console.log('Step 1: Validating user profile...')
      const validation = await this.validateClienteId(clienteId)
      console.log('User validation result:', validation)
      
      if (!validation.isValid) {
        console.error('User validation failed:', validation.error)
        return { data: null, error: validation.error }
      }
      
      console.log('Step 2: User profile validated, proceeding with ticket creation...')

      // Simplified data preparation
      const ticketToInsert = {
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion || '',
        prioridad: ticketData.prioridad || 'media',
        tipo_ticket_id: ticketData.tipo_ticket_id,
        cliente_id: clienteId,
        estado: 'abierto',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Step 3: Inserting ticket:', ticketToInsert)

      // Now insert the ticket (should work since user is validated)
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketToInsert)
        .select('*')
        .single()

      if (error) {
        console.error('Create ticket error after validation:', error)
        return { data: null, error }
      }

      console.log('Step 4: Ticket created successfully:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Create ticket error:', error)
      return { 
        data: null, 
        error: { message: `Error al crear ticket: ${error.message}` }
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