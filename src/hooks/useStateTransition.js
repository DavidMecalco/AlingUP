import { useState } from 'react'
import { useAuth } from './useAuth'
import ticketService from '../services/ticketService'
import timelineService from '../services/timelineService'
import notificationService from '../services/notificationService'

/**
 * Hook for managing ticket state transitions
 * @param {Object} ticket - Current ticket object
 * @param {Function} onStateChange - Callback when state changes successfully
 * @returns {Object} State transition utilities
 */
export const useStateTransition = (ticket, onStateChange) => {
  const { user } = useAuth()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [error, setError] = useState(null)

  // Define valid state transitions
  const stateTransitions = {
    abierto: ['en_progreso'],
    en_progreso: ['vobo', 'abierto'],
    vobo: ['cerrado', 'en_progreso'],
    cerrado: [] // Closed tickets cannot be changed
  }

  // State labels for display
  const stateLabels = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    vobo: 'VoBo',
    cerrado: 'Cerrado'
  }

  // Check if user can change state
  const canChangeState = () => {
    if (!user || !ticket) return false
    
    // Admins can change any state
    if (user.profile?.rol === 'admin') return true
    
    // Technicians can only change state of assigned tickets
    if (user.profile?.rol === 'tecnico' && ticket.tecnico_id === user.id) return true
    
    return false
  }

  // Get available next states
  const getAvailableStates = () => {
    if (!ticket?.estado) return []
    return stateTransitions[ticket.estado] || []
  }

  // Check if state transition is valid
  const isValidTransition = (fromState, toState) => {
    const validStates = stateTransitions[fromState] || []
    return validStates.includes(toState)
  }

  // Check if state change requires confirmation
  const requiresConfirmation = (newState) => {
    return newState === 'cerrado'
  }

  // Get confirmation message for state change
  const getConfirmationMessage = (newState) => {
    const messages = {
      cerrado: '¿Estás seguro de que quieres cerrar este ticket? Esta acción marcará el ticket como resuelto.'
    }
    return messages[newState] || `¿Confirmas el cambio de estado a "${stateLabels[newState]}"?`
  }

  // Execute state transition
  const transitionToState = async (newState) => {
    if (!ticket || !canChangeState() || isTransitioning) {
      return { success: false, error: 'No se puede cambiar el estado' }
    }

    if (!isValidTransition(ticket.estado, newState)) {
      return { success: false, error: 'Transición de estado no válida' }
    }

    try {
      setIsTransitioning(true)
      setError(null)

      const oldState = ticket.estado

      // Update ticket state
      const result = await ticketService.changeTicketState(ticket.id, newState, user.id)

      if (result.error) {
        const errorMessage = result.error.message || 'Error al cambiar el estado'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Create timeline entry
      try {
        await timelineService.createEvent(ticket.id, 'state_change', {
          old_state: oldState,
          new_state: newState,
          changed_by: user.id
        })
      } catch (timelineError) {
        console.error('Timeline creation error:', timelineError)
        // Don't fail the whole operation if timeline fails
      }

      // Send notifications
      try {
        await notificationService.createStateChangeNotification(
          ticket.id,
          oldState,
          newState,
          user.id
        )
      } catch (notificationError) {
        console.error('Notification creation error:', notificationError)
        // Don't fail the whole operation if notification fails
      }

      // Notify parent component
      onStateChange?.(result.data)

      return { success: true, data: result.data, oldState }

    } catch (err) {
      console.error('State transition error:', err)
      const errorMessage = 'Error al cambiar el estado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsTransitioning(false)
    }
  }

  // Batch state transitions for multiple tickets
  const batchTransitionToState = async (tickets, newState) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return { success: false, error: 'No hay tickets para procesar' }
    }

    try {
      setIsTransitioning(true)
      setError(null)

      const results = []
      const errors = []

      for (const ticket of tickets) {
        if (!isValidTransition(ticket.estado, newState)) {
          errors.push({
            ticketId: ticket.id,
            ticketNumber: ticket.ticket_number,
            error: 'Transición no válida'
          })
          continue
        }

        const result = await transitionToState(newState)
        
        if (result.success) {
          results.push({
            ticketId: ticket.id,
            ticketNumber: ticket.ticket_number,
            data: result.data
          })
        } else {
          errors.push({
            ticketId: ticket.id,
            ticketNumber: ticket.ticket_number,
            error: result.error
          })
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors,
        summary: {
          total: tickets.length,
          successful: results.length,
          failed: errors.length
        }
      }

    } catch (err) {
      console.error('Batch state transition error:', err)
      const errorMessage = 'Error en transición masiva de estados'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsTransitioning(false)
    }
  }

  return {
    // State
    isTransitioning,
    error,
    
    // Computed properties
    canChangeState: canChangeState(),
    availableStates: getAvailableStates(),
    stateLabels,
    
    // Methods
    transitionToState,
    batchTransitionToState,
    isValidTransition,
    requiresConfirmation,
    getConfirmationMessage,
    
    // Utilities
    clearError: () => setError(null)
  }
}