import { useState, useEffect, useCallback } from 'react'
import timelineService from '../services/timelineService'

/**
 * Custom hook for managing timeline events
 */
export const useTimeline = (ticketId) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load timeline events for the ticket
   */
  const loadEvents = useCallback(async () => {
    if (!ticketId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: timelineError } = await timelineService.getTimelineEvents(ticketId)
      
      if (timelineError) {
        setError(timelineError.message || 'Error al cargar eventos')
        return
      }
      
      setEvents(data)
    } catch (err) {
      console.error('Error loading timeline events:', err)
      setError('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  /**
   * Add a new timeline event
   */
  const addEvent = useCallback(async (eventoTipo, descripcion, userId = null, datosAdicionales = null) => {
    if (!ticketId) return { data: null, error: { message: 'Ticket ID requerido' } }

    try {
      const { data, error } = await timelineService.createTimelineEvent(
        ticketId,
        eventoTipo,
        descripcion,
        userId,
        datosAdicionales
      )

      if (error) {
        return { data: null, error }
      }

      // Add the new event to the current events list
      setEvents(prevEvents => [...prevEvents, data])
      
      return { data, error: null }
    } catch (err) {
      console.error('Error adding timeline event:', err)
      return { data: null, error: { message: 'Error al agregar evento' } }
    }
  }, [ticketId])

  /**
   * Create specific timeline events with helper methods
   */
  const createTicketCreatedEvent = useCallback(async (userId, ticketNumber) => {
    return timelineService.createTicketCreatedEvent(ticketId, userId, ticketNumber)
  }, [ticketId])

  const createTicketAssignedEvent = useCallback(async (tecnicoId, tecnicoName, assignedBy = null) => {
    const result = await timelineService.createTicketAssignedEvent(ticketId, tecnicoId, tecnicoName, assignedBy)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  const createStateChangedEvent = useCallback(async (oldState, newState, userId = null) => {
    const result = await timelineService.createStateChangedEvent(ticketId, oldState, newState, userId)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  const createCommentAddedEvent = useCallback(async (userId, userName) => {
    const result = await timelineService.createCommentAddedEvent(ticketId, userId, userName)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  const createFileUploadedEvent = useCallback(async (userId, fileName, fileType) => {
    const result = await timelineService.createFileUploadedEvent(ticketId, userId, fileName, fileType)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  const createTicketClosedEvent = useCallback(async (userId = null) => {
    const result = await timelineService.createTicketClosedEvent(ticketId, userId)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  const createTicketReopenedEvent = useCallback(async (userId = null) => {
    const result = await timelineService.createTicketReopenedEvent(ticketId, userId)
    if (result.data) {
      setEvents(prevEvents => [...prevEvents, result.data])
    }
    return result
  }, [ticketId])

  /**
   * Refresh timeline events
   */
  const refresh = useCallback(() => {
    loadEvents()
  }, [loadEvents])

  // Load events when ticketId changes
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return {
    events,
    loading,
    error,
    loadEvents,
    addEvent,
    createTicketCreatedEvent,
    createTicketAssignedEvent,
    createStateChangedEvent,
    createCommentAddedEvent,
    createFileUploadedEvent,
    createTicketClosedEvent,
    createTicketReopenedEvent,
    refresh
  }
}

export default useTimeline