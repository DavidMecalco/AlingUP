import { supabase } from './supabaseClient'

/**
 * Service for managing ticket timeline events
 */
class TimelineService {
  /**
   * Get timeline events for a specific ticket
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline[], error: Object|null}>}
   */
  async getTimelineEvents(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_timeline')
        .select(`
          *,
          user:user_id(id, email, nombre_completo, rol)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Get timeline events error:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get timeline events error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener eventos del timeline' } 
      }
    }
  }

  /**
   * Create a new timeline event
   * @param {string} ticketId - Ticket ID
   * @param {string} eventoTipo - Event type
   * @param {string} descripcion - Event description
   * @param {string} [userId] - User who triggered the event
   * @param {Object} [datosAdicionales] - Additional event data
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createTimelineEvent(ticketId, eventoTipo, descripcion, userId = null, datosAdicionales = null) {
    try {
      const eventData = {
        ticket_id: ticketId,
        evento_tipo: eventoTipo,
        descripcion,
        user_id: userId,
        datos_adicionales: datosAdicionales
      }

      const { data, error } = await supabase
        .from('ticket_timeline')
        .insert(eventData)
        .select(`
          *,
          user:user_id(id, email, nombre_completo, rol)
        `)
        .single()

      if (error) {
        console.error('Create timeline event error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Create timeline event error:', error)
      return { 
        data: null, 
        error: { message: 'Error al crear evento del timeline' } 
      }
    }
  }

  /**
   * Create timeline event for ticket creation
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User who created the ticket
   * @param {string} ticketNumber - Ticket number for display
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createTicketCreatedEvent(ticketId, userId, ticketNumber) {
    return this.createTimelineEvent(
      ticketId,
      'ticket_creado',
      `Ticket ${ticketNumber} creado`,
      userId,
      { ticket_number: ticketNumber }
    )
  }

  /**
   * Create timeline event for ticket assignment
   * @param {string} ticketId - Ticket ID
   * @param {string} tecnicoId - Technician ID
   * @param {string} tecnicoName - Technician name
   * @param {string} [assignedBy] - User who made the assignment
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createTicketAssignedEvent(ticketId, tecnicoId, tecnicoName, assignedBy = null) {
    return this.createTimelineEvent(
      ticketId,
      'ticket_asignado',
      `Ticket asignado a ${tecnicoName}`,
      assignedBy,
      { tecnico_id: tecnicoId, tecnico_name: tecnicoName }
    )
  }

  /**
   * Create timeline event for state change
   * @param {string} ticketId - Ticket ID
   * @param {string} oldState - Previous state
   * @param {string} newState - New state
   * @param {string} [userId] - User who changed the state
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createStateChangedEvent(ticketId, oldState, newState, userId = null) {
    const stateLabels = {
      'abierto': 'Abierto',
      'en_progreso': 'En Progreso',
      'vobo': 'VoBo',
      'cerrado': 'Cerrado'
    }

    return this.createTimelineEvent(
      ticketId,
      'estado_cambiado',
      `Estado cambiado de ${stateLabels[oldState]} a ${stateLabels[newState]}`,
      userId,
      { old_state: oldState, new_state: newState }
    )
  }

  /**
   * Create a generic timeline event with flexible event data
   * @param {string} ticketId - Ticket ID
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data containing details
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createEvent(ticketId, eventType, eventData = {}) {
    try {
      let descripcion = ''
      let userId = eventData.changed_by || eventData.user_id || null
      let datosAdicionales = { ...eventData }

      // Generate description based on event type
      switch (eventType) {
        case 'state_change':
          const stateLabels = {
            'abierto': 'Abierto',
            'en_progreso': 'En Progreso',
            'vobo': 'VoBo',
            'cerrado': 'Cerrado'
          }
          descripcion = `Estado cambiado de ${stateLabels[eventData.old_state]} a ${stateLabels[eventData.new_state]}`
          break
        
        case 'assignment':
          if (eventData.tecnico_name) {
            descripcion = `Ticket asignado a ${eventData.tecnico_name}`
          } else {
            descripcion = 'Asignación de ticket removida'
          }
          break
        
        case 'comment':
          descripcion = `${eventData.user_name || 'Usuario'} agregó un comentario`
          break
        
        case 'file_upload':
          const typeLabels = {
            'foto': 'imagen',
            'video': 'video',
            'documento': 'documento',
            'nota_voz': 'nota de voz'
          }
          descripcion = `Se subió ${typeLabels[eventData.file_type] || 'archivo'}: ${eventData.file_name}`
          break
        
        default:
          descripcion = eventData.description || `Evento: ${eventType}`
      }

      return this.createTimelineEvent(
        ticketId,
        eventType,
        descripcion,
        userId,
        datosAdicionales
      )
    } catch (error) {
      console.error('Create generic event error:', error)
      return { 
        data: null, 
        error: { message: 'Error al crear evento del timeline' } 
      }
    }
  }

  /**
   * Create timeline event for comment addition
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User who added the comment
   * @param {string} userName - User name
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createCommentAddedEvent(ticketId, userId, userName) {
    return this.createTimelineEvent(
      ticketId,
      'comentario_agregado',
      `${userName} agregó un comentario`,
      userId,
      { user_name: userName }
    )
  }

  /**
   * Create timeline event for file upload
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User who uploaded the file
   * @param {string} fileName - File name
   * @param {string} fileType - File type
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createFileUploadedEvent(ticketId, userId, fileName, fileType) {
    const typeLabels = {
      'foto': 'imagen',
      'video': 'video',
      'documento': 'documento',
      'nota_voz': 'nota de voz'
    }

    return this.createTimelineEvent(
      ticketId,
      'archivo_subido',
      `Se subió ${typeLabels[fileType] || 'archivo'}: ${fileName}`,
      userId,
      { file_name: fileName, file_type: fileType }
    )
  }

  /**
   * Create timeline event for ticket closure
   * @param {string} ticketId - Ticket ID
   * @param {string} [userId] - User who closed the ticket
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createTicketClosedEvent(ticketId, userId = null) {
    return this.createTimelineEvent(
      ticketId,
      'ticket_cerrado',
      'Ticket cerrado',
      userId
    )
  }

  /**
   * Create timeline event for ticket reopening
   * @param {string} ticketId - Ticket ID
   * @param {string} [userId] - User who reopened the ticket
   * @returns {Promise<{data: import('../types/index.js').TicketTimeline|null, error: Object|null}>}
   */
  async createTicketReopenedEvent(ticketId, userId = null) {
    return this.createTimelineEvent(
      ticketId,
      'ticket_reabierto',
      'Ticket reabierto',
      userId
    )
  }

  /**
   * Get timeline statistics for a ticket
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getTimelineStats(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_timeline')
        .select('evento_tipo, created_at')
        .eq('ticket_id', ticketId)

      if (error) {
        console.error('Get timeline stats error:', error)
        return { data: null, error }
      }

      const stats = {
        total_events: data.length,
        events_by_type: data.reduce((acc, event) => {
          acc[event.evento_tipo] = (acc[event.evento_tipo] || 0) + 1
          return acc
        }, {}),
        first_event: data.length > 0 ? data[0].created_at : null,
        last_event: data.length > 0 ? data[data.length - 1].created_at : null
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Get timeline stats error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener estadísticas del timeline' } 
      }
    }
  }

  /**
   * Delete timeline events for a ticket (admin only)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteTimelineEvents(ticketId) {
    try {
      const { error } = await supabase
        .from('ticket_timeline')
        .delete()
        .eq('ticket_id', ticketId)

      if (error) {
        console.error('Delete timeline events error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete timeline events error:', error)
      return { error: { message: 'Error al eliminar eventos del timeline' } }
    }
  }
}

// Create and export singleton instance
const timelineService = new TimelineService()
export default timelineService