import { useState, useEffect, useCallback } from 'react'
import ticketService from '../services/ticketService'
import { useAuth } from './useAuth'

/**
 * Custom hook for managing tickets with filtering and real-time updates
 * @param {Object} options - Hook options
 * @param {Object} options.filters - Ticket filters
 * @param {string} options.searchTerm - Search term
 * @param {boolean} options.autoFetch - Whether to auto-fetch on mount
 * @returns {Object} Tickets state and actions
 */
export const useTickets = ({ 
  filters = {}, 
  searchTerm = '', 
  autoFetch = true 
} = {}) => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch tickets based on user role and filters
  const fetchTickets = useCallback(async (customFilters = {}) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const ticketFilters = {
        ...filters,
        ...customFilters,
        search: searchTerm
      }

      let result
      if (user.rol === 'tecnico') {
        // Technicians only see assigned tickets
        result = await ticketService.getTicketsByTechnician(user.id, ticketFilters)
      } else if (user.rol === 'cliente') {
        // Clients only see their own tickets
        result = await ticketService.getTicketsByClient(user.id, ticketFilters)
      } else {
        // Admins see all tickets
        result = await ticketService.getTickets(ticketFilters)
      }

      if (result.error) {
        setError(result.error.message || 'Error al cargar tickets')
        setTickets([])
        setTotalCount(0)
      } else {
        setTickets(result.data || [])
        setTotalCount(result.count || 0)
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Error al cargar tickets')
      setTickets([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [user, filters, searchTerm])

  // Update ticket state optimistically
  const updateTicketState = useCallback(async (ticketId, newState) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' }

    // Optimistic update
    const originalTickets = [...tickets]
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, estado: newState, updated_at: new Date().toISOString() }
          : ticket
      )
    )

    try {
      const result = await ticketService.changeTicketState(ticketId, newState)
      
      if (result.error) {
        // Rollback on error
        setTickets(originalTickets)
        setError(result.error.message || 'Error al actualizar ticket')
        return { success: false, error: result.error.message }
      }

      // Update with server response
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId ? result.data : ticket
        )
      )

      return { success: true, data: result.data }
    } catch (err) {
      // Rollback on error
      setTickets(originalTickets)
      const errorMessage = 'Error al actualizar ticket'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [tickets, user])

  // Assign ticket to technician
  const assignTicket = useCallback(async (ticketId, tecnicoId) => {
    if (!user || user.rol !== 'admin') {
      return { success: false, error: 'No tienes permisos para asignar tickets' }
    }

    try {
      const result = await ticketService.assignTicket(ticketId, tecnicoId)
      
      if (result.error) {
        setError(result.error.message || 'Error al asignar ticket')
        return { success: false, error: result.error.message }
      }

      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId ? result.data : ticket
        )
      )

      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage = 'Error al asignar ticket'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [user])

  // Create new ticket
  const createTicket = useCallback(async (ticketData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' }

    try {
      setLoading(true)
      const result = await ticketService.createTicket(ticketData, user.id)
      
      if (result.error) {
        setError(result.error.message || 'Error al crear ticket')
        return { success: false, error: result.error.message }
      }

      // Add to local state if it matches current filters
      const shouldInclude = user.rol === 'admin' || 
                           (user.rol === 'cliente' && result.data.cliente_id === user.id) ||
                           (user.rol === 'tecnico' && result.data.tecnico_id === user.id)

      if (shouldInclude) {
        setTickets(prevTickets => [result.data, ...prevTickets])
        setTotalCount(prevCount => prevCount + 1)
      }

      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage = 'Error al crear ticket'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Group tickets by state (useful for Kanban board)
  const ticketsByState = tickets.reduce((acc, ticket) => {
    const state = ticket.estado
    if (!acc[state]) {
      acc[state] = []
    }
    acc[state].push(ticket)
    return acc
  }, {})

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh tickets
  const refresh = useCallback(() => {
    return fetchTickets()
  }, [fetchTickets])

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch && user) {
      fetchTickets()
    }
  }, [fetchTickets, autoFetch, user])

  return {
    // State
    tickets,
    ticketsByState,
    loading,
    error,
    totalCount,
    
    // Actions
    fetchTickets,
    updateTicketState,
    assignTicket,
    createTicket,
    clearError,
    refresh
  }
}

export default useTickets