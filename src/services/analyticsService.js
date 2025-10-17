import { supabase } from './supabaseClient'
import { STATE_CONFIG, PRIORITY_CONFIG } from '../utils/constants'

/**
 * Service for analytics and dashboard data aggregation
 */
class AnalyticsService {
  /**
   * Get dashboard KPIs and summary metrics
   * @param {Object} filters - Optional filters for data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getDashboardKPIs(filters = {}) {
    try {
      let query = supabase.from('tickets').select('*')

      // Apply filters if provided
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id)
      }
      if (filters.tecnico_id) {
        query = query.eq('tecnico_id', filters.tecnico_id)
      }
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta)
      }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Get dashboard KPIs error:', error)
        return { data: null, error }
      }

      // Calculate KPIs
      const totalTickets = tickets.length
      const openTickets = tickets.filter(t => t.estado !== 'cerrado').length
      const closedTickets = tickets.filter(t => t.estado === 'cerrado').length
      const urgentTickets = tickets.filter(t => t.prioridad === 'urgente').length

      // Calculate average resolution time for closed tickets
      const closedTicketsWithTime = tickets.filter(t => t.estado === 'cerrado' && t.closed_at)
      const avgResolutionTime = this.calculateAverageResolutionTime(closedTicketsWithTime)

      // Calculate tickets by state
      const ticketsByState = this.aggregateByField(tickets, 'estado')
      
      // Calculate tickets by priority
      const ticketsByPriority = this.aggregateByField(tickets, 'prioridad')

      return {
        data: {
          totalTickets,
          openTickets,
          closedTickets,
          urgentTickets,
          avgResolutionTime,
          ticketsByState,
          ticketsByPriority
        },
        error: null
      }
    } catch (error) {
      console.error('Get dashboard KPIs error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener métricas del dashboard' } 
      }
    }
  }

  /**
   * Get tickets by technician for bar chart
   * @param {Object} filters - Optional filters
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getTicketsByTechnician(filters = {}) {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          tecnico_id,
          tecnico:tecnico_id(nombre_completo)
        `)

      // Apply filters
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta)
      }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Get tickets by technician error:', error)
        return { data: null, error }
      }

      // Aggregate by technician
      const technicianCounts = {}
      tickets.forEach(ticket => {
        if (ticket.tecnico_id && ticket.tecnico) {
          const name = ticket.tecnico.nombre_completo
          technicianCounts[name] = (technicianCounts[name] || 0) + 1
        } else {
          technicianCounts['Sin asignar'] = (technicianCounts['Sin asignar'] || 0) + 1
        }
      })

      const chartData = Object.entries(technicianCounts).map(([name, value]) => ({
        name,
        value
      }))

      return { data: chartData, error: null }
    } catch (error) {
      console.error('Get tickets by technician error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener tickets por técnico' } 
      }
    }
  }

  /**
   * Get tickets by client for bar chart
   * @param {Object} filters - Optional filters
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getTicketsByClient(filters = {}) {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          cliente_id,
          cliente:cliente_id(nombre_completo, empresa_cliente)
        `)

      // Apply filters
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta)
      }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Get tickets by client error:', error)
        return { data: null, error }
      }

      // Aggregate by client
      const clientCounts = {}
      tickets.forEach(ticket => {
        if (ticket.cliente) {
          const name = ticket.cliente.empresa_cliente || ticket.cliente.nombre_completo
          clientCounts[name] = (clientCounts[name] || 0) + 1
        }
      })

      const chartData = Object.entries(clientCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Sort by count descending
        .slice(0, 10) // Top 10 clients

      return { data: chartData, error: null }
    } catch (error) {
      console.error('Get tickets by client error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener tickets por cliente' } 
      }
    }
  }

  /**
   * Get ticket evolution over time for line chart
   * @param {Object} filters - Optional filters
   * @param {string} period - Time period ('day', 'week', 'month')
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getTicketEvolution(filters = {}, period = 'week') {
    try {
      let query = supabase
        .from('tickets')
        .select('created_at, estado')
        .order('created_at')

      // Apply filters
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta)
      }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Get ticket evolution error:', error)
        return { data: null, error }
      }

      // Group tickets by time period
      const evolutionData = this.groupTicketsByPeriod(tickets, period)

      return { data: evolutionData, error: null }
    } catch (error) {
      console.error('Get ticket evolution error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener evolución de tickets' } 
      }
    }
  }

  /**
   * Get resolution time statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getResolutionTimeStats(filters = {}) {
    try {
      let query = supabase
        .from('tickets')
        .select('created_at, closed_at, prioridad')
        .not('closed_at', 'is', null)

      // Apply filters
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta)
      }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Get resolution time stats error:', error)
        return { data: null, error }
      }

      const resolutionTimes = tickets.map(ticket => {
        const created = new Date(ticket.created_at)
        const closed = new Date(ticket.closed_at)
        const resolutionHours = (closed - created) / (1000 * 60 * 60)
        return {
          hours: resolutionHours,
          priority: ticket.prioridad
        }
      })

      const avgResolutionTime = resolutionTimes.reduce((sum, t) => sum + t.hours, 0) / resolutionTimes.length
      
      // Group by priority
      const byPriority = {}
      Object.keys(PRIORITY_CONFIG).forEach(priority => {
        const priorityTimes = resolutionTimes.filter(t => t.priority === priority)
        byPriority[priority] = {
          count: priorityTimes.length,
          avgHours: priorityTimes.length > 0 
            ? priorityTimes.reduce((sum, t) => sum + t.hours, 0) / priorityTimes.length 
            : 0
        }
      })

      return {
        data: {
          avgResolutionTime,
          byPriority,
          totalResolved: tickets.length
        },
        error: null
      }
    } catch (error) {
      console.error('Get resolution time stats error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener estadísticas de tiempo de resolución' } 
      }
    }
  }

  /**
   * Helper method to aggregate tickets by a field
   * @param {Array} tickets - Array of tickets
   * @param {string} field - Field to aggregate by
   * @returns {Array} Chart data array
   */
  aggregateByField(tickets, field) {
    const counts = {}
    tickets.forEach(ticket => {
      const value = ticket[field]
      counts[value] = (counts[value] || 0) + 1
    })

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      label: this.getFieldLabel(field, name)
    }))
  }

  /**
   * Get human-readable label for field values
   * @param {string} field - Field name
   * @param {string} value - Field value
   * @returns {string} Human-readable label
   */
  getFieldLabel(field, value) {
    if (field === 'estado') {
      return STATE_CONFIG[value]?.label || value
    }
    if (field === 'prioridad') {
      return PRIORITY_CONFIG[value]?.label || value
    }
    return value
  }

  /**
   * Calculate average resolution time in hours
   * @param {Array} closedTickets - Array of closed tickets
   * @returns {number} Average resolution time in hours
   */
  calculateAverageResolutionTime(closedTickets) {
    if (closedTickets.length === 0) return 0

    const totalHours = closedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.created_at)
      const closed = new Date(ticket.closed_at)
      const hours = (closed - created) / (1000 * 60 * 60)
      return sum + hours
    }, 0)

    return totalHours / closedTickets.length
  }

  /**
   * Group tickets by time period for evolution chart
   * @param {Array} tickets - Array of tickets
   * @param {string} period - Time period ('day', 'week', 'month')
   * @returns {Array} Chart data array
   */
  groupTicketsByPeriod(tickets, period) {
    const groups = {}
    
    tickets.forEach(ticket => {
      const date = new Date(ticket.created_at)
      let key

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      groups[key] = (groups[key] || 0) + 1
    })

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService()
export default analyticsService