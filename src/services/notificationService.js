import { supabase } from './supabaseClient'

/**
 * Service for managing notifications and alerts
 */
class NotificationService {
  /**
   * Create a notification for ticket assignment
   * @param {string} ticketId - Ticket ID
   * @param {string} tecnicoId - Technician ID
   * @param {string} assignedBy - User ID who made the assignment
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createAssignmentNotification(ticketId, tecnicoId, assignedBy) {
    try {
      // Get ticket information
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('ticket_number, titulo, cliente:cliente_id(nombre_completo)')
        .eq('id', ticketId)
        .single()

      if (ticketError) {
        console.error('Get ticket for notification error:', ticketError)
        return { data: null, error: ticketError }
      }

      // Get assigner information
      const { data: assigner, error: assignerError } = await supabase
        .from('users')
        .select('nombre_completo')
        .eq('id', assignedBy)
        .single()

      if (assignerError) {
        console.error('Get assigner for notification error:', assignerError)
        return { data: null, error: assignerError }
      }

      // Create notification record (if you have a notifications table)
      // For now, we'll just log the notification
      const notificationData = {
        type: 'ticket_assignment',
        recipient_id: tecnicoId,
        ticket_id: ticketId,
        title: 'Nuevo ticket asignado',
        message: `Se te ha asignado el ticket #${ticket.ticket_number}: "${ticket.titulo}" por ${assigner.nombre_completo}`,
        data: {
          ticket_number: ticket.ticket_number,
          ticket_title: ticket.titulo,
          client_name: ticket.cliente?.nombre_completo,
          assigned_by: assigner.nombre_completo
        },
        created_at: new Date().toISOString(),
        read: false
      }

      console.log('Assignment notification created:', notificationData)

      // In a real implementation, you would:
      // 1. Insert into notifications table
      // 2. Send real-time notification via Supabase realtime
      // 3. Send email notification if configured
      // 4. Send push notification if mobile app exists

      return { data: notificationData, error: null }
    } catch (error) {
      console.error('Create assignment notification error:', error)
      return { 
        data: null, 
        error: { message: 'Error al crear notificación' } 
      }
    }
  }

  /**
   * Create a notification for state change
   * @param {string} ticketId - Ticket ID
   * @param {string} oldState - Previous state
   * @param {string} newState - New state
   * @param {string} changedBy - User ID who made the change
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createStateChangeNotification(ticketId, oldState, newState, changedBy) {
    try {
      // Get ticket information
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          ticket_number, 
          titulo, 
          cliente:cliente_id(id, nombre_completo),
          tecnico:tecnico_id(id, nombre_completo)
        `)
        .eq('id', ticketId)
        .single()

      if (ticketError) {
        console.error('Get ticket for state notification error:', ticketError)
        return { data: null, error: ticketError }
      }

      // Get user who made the change
      const { data: changer, error: changerError } = await supabase
        .from('users')
        .select('nombre_completo, rol')
        .eq('id', changedBy)
        .single()

      if (changerError) {
        console.error('Get changer for notification error:', changerError)
        return { data: null, error: changerError }
      }

      const stateLabels = {
        abierto: 'Abierto',
        en_progreso: 'En Progreso',
        vobo: 'VoBo',
        cerrado: 'Cerrado'
      }

      // Determine who should receive the notification
      const recipients = []
      
      // Always notify the client
      if (ticket.cliente?.id) {
        recipients.push({
          id: ticket.cliente.id,
          name: ticket.cliente.nombre_completo,
          role: 'cliente'
        })
      }

      // Notify the assigned technician if different from the changer
      if (ticket.tecnico?.id && ticket.tecnico.id !== changedBy) {
        recipients.push({
          id: ticket.tecnico.id,
          name: ticket.tecnico.nombre_completo,
          role: 'tecnico'
        })
      }

      const notifications = recipients.map(recipient => ({
        type: 'state_change',
        recipient_id: recipient.id,
        ticket_id: ticketId,
        title: 'Estado de ticket actualizado',
        message: `El ticket #${ticket.ticket_number} cambió de "${stateLabels[oldState]}" a "${stateLabels[newState]}" por ${changer.nombre_completo}`,
        data: {
          ticket_number: ticket.ticket_number,
          ticket_title: ticket.titulo,
          old_state: oldState,
          new_state: newState,
          old_state_label: stateLabels[oldState],
          new_state_label: stateLabels[newState],
          changed_by: changer.nombre_completo,
          changed_by_role: changer.rol
        },
        created_at: new Date().toISOString(),
        read: false
      }))

      console.log('State change notifications created:', notifications)

      return { data: notifications, error: null }
    } catch (error) {
      console.error('Create state change notification error:', error)
      return { 
        data: null, 
        error: { message: 'Error al crear notificación de cambio de estado' } 
      }
    }
  }

  /**
   * Send bulk assignment notifications
   * @param {Array} assignments - Array of {ticketId, tecnicoId} objects
   * @param {string} assignedBy - User ID who made the assignments
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async createBulkAssignmentNotifications(assignments, assignedBy) {
    try {
      const notifications = []

      for (const assignment of assignments) {
        const result = await this.createAssignmentNotification(
          assignment.ticketId,
          assignment.tecnicoId,
          assignedBy
        )

        if (result.error) {
          console.error(`Failed to create notification for ticket ${assignment.ticketId}:`, result.error)
        } else {
          notifications.push(result.data)
        }
      }

      return { data: notifications, error: null }
    } catch (error) {
      console.error('Create bulk assignment notifications error:', error)
      return { 
        data: [], 
        error: { message: 'Error al crear notificaciones masivas' } 
      }
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService