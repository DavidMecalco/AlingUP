import { supabase } from './supabaseClient'

/**
 * Service for managing tickets with CRUD operations
 */
class TicketService {
  /**
   * Get all tickets with optional filtering and pagination
   * @param {import('../types/index.js').TicketFilters} filters - Filter options
   * @param {import('../types/index.js').PaginationOptions} pagination - Pagination options
   * @returns {Promise<{data: import('../types/index.js').Ticket[], error: Object|null, count: number}>}
   */
  async getTickets(filters = {}, pagination = {}) {
    try {
      const { 
        estados, 
        prioridades, 
        tipos, 
        tecnicos, 
        clientes, 
        search, 
        fecha_desde, 
        fecha_hasta 
      } = filters

      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'created_at', 
        sortOrder = 'desc' 
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
        query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`)
      }

      if (fecha_desde) {
        query = query.gte('created_at', fecha_desde.toISOString())
      }

      if (fecha_hasta) {
        query = query.lte('created_at', fecha_hasta.toISOString())
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Get tickets error:', error)
        return { data: [], error, count: 0 }
      }

      return { data: data || [], error: null, count: count || 0 }
    } catch (error) {
      console.error('Get tickets error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener tickets' }, 
        count: 0 
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
   * Create a new ticket
   * @param {import('../types/index.js').CreateTicketData} ticketData - Ticket data
   * @param {string} clienteId - Client user ID
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async createTicket(ticketData, clienteId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          cliente_id: clienteId
        })
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `)
        .single()

      if (error) {
        console.error('Create ticket error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Create ticket error:', error)
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
   * @param {string} tecnicoId - Technician user ID
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async assignTicket(ticketId, tecnicoId) {
    return this.updateTicket(ticketId, { tecnico_id: tecnicoId })
  }

  /**
   * Change ticket state
   * @param {string} ticketId - Ticket ID
   * @param {import('../types/index.js').TicketEstado} newState - New state
   * @returns {Promise<{data: import('../types/index.js').Ticket|null, error: Object|null}>}
   */
  async changeTicketState(ticketId, newState) {
    const updateData = { estado: newState }
    
    // Set closed_at when closing ticket
    if (newState === 'cerrado') {
      updateData.closed_at = new Date().toISOString()
    } else if (newState !== 'cerrado') {
      updateData.closed_at = null
    }

    return this.updateTicket(ticketId, updateData)
  }

  /**
   * Get ticket types
   * @param {boolean} activeOnly - Only return active types
   * @returns {Promise<{data: import('../types/index.js').TicketType[], error: Object|null}>}
   */
  async getTicketTypes(activeOnly = true) {
    try {
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