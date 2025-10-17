import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketCard from './TicketCard'
import { useAuth } from '../../hooks/useAuth'
import ticketService from '../../services/ticketService'
import { debounce } from '../../utils/helpers'

const TicketList = ({ 
  filters = {}, 
  showClient = false, 
  showTechnician = false,
  emptyMessage = "No se encontraron tickets",
  emptyDescription = "Los tickets aparecerán aquí cuando se creen"
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
    count: 0
  })

  // Debounced search function
  const debouncedLoadTickets = debounce(loadTickets, 300)

  // Load tickets function
  async function loadTickets(page = 1, resetList = false) {
    try {
      if (resetList) {
        setIsLoading(true)
      }

      const paginationOptions = {
        page,
        limit: pagination.limit,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }

      let result
      
      // Apply role-based filtering
      if (user?.profile?.rol === 'cliente') {
        result = await ticketService.getTicketsByClient(user.id, filters)
      } else if (user?.profile?.rol === 'tecnico') {
        result = await ticketService.getTicketsByTechnician(user.id, filters)
      } else {
        result = await ticketService.getTickets(filters, paginationOptions)
      }

      if (result.error) {
        setError(result.error.message || 'Error al cargar tickets')
        return
      }

      const newTickets = result.data || []
      const totalCount = result.count || 0
      const totalPages = Math.ceil(totalCount / pagination.limit)

      if (resetList || page === 1) {
        setTickets(newTickets)
      } else {
        setTickets(prev => [...prev, ...newTickets])
      }

      setPagination(prev => ({
        ...prev,
        page,
        totalPages,
        count: totalCount,
        hasMore: page < totalPages
      }))

      setError(null)
    } catch (error) {
      console.error('Load tickets error:', error)
      setError('Error inesperado al cargar tickets')
    } finally {
      setIsLoading(false)
    }
  }

  // Load tickets on component mount and when filters change
  useEffect(() => {
    debouncedLoadTickets(1, true)
  }, [filters, user])

  // Handle ticket click
  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket.id}`)
  }

  // Handle load more
  const handleLoadMore = () => {
    if (!isLoading && pagination.hasMore) {
      loadTickets(pagination.page + 1, false)
    }
  }

  // Loading state
  if (isLoading && tickets.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="rounded-md bg-red-50 p-4 max-w-md mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar tickets
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => loadTickets(1, true)}
                  className="text-sm bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 mb-6">
          {emptyDescription}
        </p>
        {(user?.profile?.rol === 'cliente' || user?.profile?.rol === 'admin') && (
          <button
            onClick={() => navigate('/tickets/create')}
            className="btn-primary"
          >
            Crear Primer Ticket
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{tickets.length}</span> de{' '}
          <span className="font-medium">{pagination.count}</span> tickets
        </p>
        {pagination.count > 0 && (
          <div className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </div>
        )}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={handleTicketClick}
            showClient={showClient}
            showTechnician={showTechnician}
          />
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Cargando...
              </div>
            ) : (
              `Cargar más tickets (${pagination.count - tickets.length} restantes)`
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketList