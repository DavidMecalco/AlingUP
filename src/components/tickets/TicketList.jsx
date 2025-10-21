import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketCard from './TicketCard'
import { useAuth } from '../../hooks/useAuth'
import ticketService from '../../services/ticketService'
import { debounce } from '../../utils/helpers'
import { 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Ticket,
  Loader,
  ChevronDown
} from 'lucide-react'
import '../../styles/glass.css'

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="glass-morphism rounded-2xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-white/20 rounded w-20"></div>
                  <div className="h-5 bg-white/20 rounded-full w-16"></div>
                </div>
                <div className="h-6 bg-white/20 rounded w-3/4"></div>
              </div>
              <div className="h-5 bg-white/20 rounded-full w-12"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="h-4 bg-white/20 rounded w-24"></div>
              <div className="h-4 bg-white/20 rounded w-20"></div>
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
        <div className="glass-morphism rounded-2xl p-8 max-w-md mx-auto bg-red-500/10 border-red-400/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                Error al cargar tickets
              </h3>
              <p className="text-white/70 mb-4">{error}</p>
              <button
                onClick={() => loadTickets(1, true)}
                className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Intentar de nuevo</span>
              </button>
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
        <div className="glass-morphism rounded-2xl p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center">
              <Ticket className="w-10 h-10 text-white/40" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">
                {emptyMessage}
              </h3>
              <p className="text-white/70 mb-6">
                {emptyDescription}
              </p>
              {(user?.profile?.rol === 'cliente' || user?.profile?.rol === 'admin') && (
                <button
                  onClick={() => navigate('/tickets/create')}
                  className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Primer Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="glass-morphism rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80">
            Mostrando <span className="font-medium text-white">{tickets.length}</span> de{' '}
            <span className="font-medium text-white">{pagination.count}</span> tickets
          </p>
          {pagination.count > 0 && (
            <div className="text-sm text-white/60">
              Página {pagination.page} de {pagination.totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tickets.map((ticket, index) => (
          <div 
            key={ticket.id}
            className="animate-slide-up"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <TicketCard
              ticket={ticket}
              onClick={handleTicketClick}
              showClient={showClient}
              showTechnician={showTechnician}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="glass-button px-8 py-4 rounded-2xl text-white font-medium bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin w-5 h-5" />
                <span>Cargando...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span>Cargar más tickets ({pagination.count - tickets.length} restantes)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketList