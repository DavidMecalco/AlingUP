import { useState, useEffect } from 'react'
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
  ChevronDown,
  BarChart3
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
        <div className="glass-morphism rounded-2xl p-8 max-w-md mx-auto bg-gradient-to-br from-red-50/80 to-pink-50/80 border border-red-200/50">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-200/30">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Error al cargar tickets
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={() => loadTickets(1, true)}
                className="glass-button px-8 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border border-red-200/50 transition-all duration-300 flex items-center space-x-3 shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
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
      <div className="text-center py-16">
        <div className="glass-morphism rounded-3xl p-12 max-w-lg mx-auto bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50">
          <div className="flex flex-col items-center space-y-8">
            <div className="w-24 h-24 glass-morphism rounded-3xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
              <Ticket className="w-12 h-12 text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {emptyMessage}
              </h3>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                {emptyDescription}
              </p>
              {(user?.profile?.rol === 'cliente' || user?.profile?.rol === 'admin') && (
                <button
                  onClick={() => navigate('/tickets/create')}
                  className="glass-button px-8 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200/50 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-6 h-6" />
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
    <div className="space-y-8">
      {/* Enhanced Results Summary */}
      <div className="glass-morphism rounded-2xl p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Mostrando <span className="text-blue-600">{tickets.length}</span> de{' '}
                <span className="text-blue-600">{pagination.count}</span> tickets
              </p>
              <p className="text-gray-600 text-sm">Resultados de búsqueda actualizados</p>
            </div>
          </div>
          {pagination.count > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                Página {pagination.page} de {pagination.totalPages}
              </div>
              <div className="text-gray-600 text-sm">Navegación de resultados</div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {tickets.map((ticket, index) => (
          <div 
            key={ticket.id}
            className="animate-slide-up"
            style={{animationDelay: `${index * 0.05}s`}}
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

      {/* Enhanced Load More Button */}
      {pagination.hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="glass-button px-10 py-5 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200/50 transition-all duration-300 flex items-center space-x-4 mx-auto shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin w-6 h-6" />
                <span className="text-lg">Cargando más tickets...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-6 h-6" />
                <span className="text-lg">Cargar más tickets</span>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {pagination.count - tickets.length} restantes
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketList