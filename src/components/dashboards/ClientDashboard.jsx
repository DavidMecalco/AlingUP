import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DonutChart, LineChart } from './charts'
import KPICard from './KPICard'
import TicketCard from '../tickets/TicketCard'
import analyticsService from '../../services/analyticsService'
import ticketService from '../../services/ticketService'
import { useAuth } from '../../hooks/useAuth'

/**
 * Client dashboard view showing personal ticket summary and recent activity
 * Designed for clients to see their own tickets and create new ones
 * @returns {JSX.Element}
 */
const ClientDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [kpis, setKpis] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [ticketEvolution, setTicketEvolution] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadClientDashboardData()
    }
  }, [user?.id])

  const loadClientDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const clientId = user.id
      const filters = {
        clientes: [clientId]
      }

      // Load client-specific dashboard data
      const [
        kpisResult,
        recentTicketsResult,
        evolutionResult
      ] = await Promise.all([
        analyticsService.getDashboardKPIs(filters),
        ticketService.getTicketsByClient(clientId, { 
          ...filters, 
          limit: 5,
          sortBy: 'created_at',
          sortOrder: 'desc'
        }),
        analyticsService.getTicketEvolution(filters, 'week')
      ])

      // Handle KPIs
      if (kpisResult.error) {
        throw new Error(kpisResult.error.message)
      }
      setKpis(kpisResult.data)

      // Handle recent tickets
      if (recentTicketsResult.error) {
        console.error('Error loading recent tickets:', recentTicketsResult.error)
      } else {
        setRecentTickets(recentTicketsResult.data || [])
      }

      // Handle evolution data
      if (evolutionResult.error) {
        console.error('Error loading evolution data:', evolutionResult.error)
      } else {
        setTicketEvolution(evolutionResult.data || [])
      }

    } catch (error) {
      console.error('Error loading client dashboard data:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatResolutionTime = (hours) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = Math.round(hours % 24)
      return `${days}d ${remainingHours}h`
    }
  }

  const getStateChartData = () => {
    if (!kpis?.ticketsByState) return []
    
    return kpis.ticketsByState.map(item => ({
      name: item.label || item.name,
      value: item.value
    }))
  }

  const handleCreateTicket = () => {
    navigate('/tickets/create')
  }

  const handleViewAllTickets = () => {
    navigate('/tickets')
  }

  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket.id}`)
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Acceso Requerido</h3>
          <p className="text-yellow-600">Debes iniciar sesión para ver tu dashboard.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadClientDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.profile?.nombre_completo || user?.email}
          </p>
        </div>
        <button 
          onClick={loadClientDashboardData}
          disabled={isLoading}
          className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Prominent Create New Ticket CTA */}
      <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h2>
            <p className="text-fuchsia-100 mb-4">
              Crea un nuevo ticket para reportar problemas o solicitar asistencia técnica
            </p>
            <button
              onClick={handleCreateTicket}
              className="bg-white text-fuchsia-600 font-semibold px-6 py-3 rounded-lg hover:bg-fuchsia-50 transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Crear Nuevo Ticket
            </button>
          </div>
          <div className="hidden md:block">
            <svg className="w-24 h-24 text-fuchsia-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Personal Ticket Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Mis Tickets"
          value={kpis?.totalTickets || 0}
          subtitle="Total de tickets creados"
          icon="🎫"
          color="blue"
          isLoading={isLoading}
        />
        <KPICard
          title="En Progreso"
          value={kpis?.openTickets || 0}
          subtitle="Tickets activos"
          icon="⚡"
          color="yellow"
          isLoading={isLoading}
        />
        <KPICard
          title="Resueltos"
          value={kpis?.closedTickets || 0}
          subtitle="Tickets completados"
          icon="✅"
          color="green"
          isLoading={isLoading}
        />
        <KPICard
          title="Urgentes"
          value={kpis?.urgentTickets || 0}
          subtitle="Requieren atención"
          icon="🚨"
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Recent Ticket Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <button
              onClick={handleViewAllTickets}
              className="text-fuchsia-600 hover:text-fuchsia-700 text-sm font-medium"
            >
              Ver todos mis tickets →
            </button>
          </div>
        </div>
        <div className="p-6">
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 mb-2">No tienes tickets recientes</p>
              <p className="text-gray-400 text-sm">Crea tu primer ticket para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={handleTicketClick}
                  showClient={false}
                  showTechnician={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Overview and Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by State - Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DonutChart
            data={getStateChartData()}
            title="Estado de Mis Tickets"
            centerText="Total"
            height={300}
          />
        </div>

        {/* Evolution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LineChart
            data={ticketEvolution}
            title="Evolución de Mis Tickets"
            color="#d946ef"
            height={300}
          />
        </div>
      </div>

      {/* Average Resolution Time */}
      {kpis?.avgResolutionTime > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiempo de Resolución</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-fuchsia-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-fuchsia-100 rounded-lg">
                  <svg className="w-6 h-6 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-fuchsia-600">
                    {formatResolutionTime(kpis.avgResolutionTime)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tickets Resueltos</p>
                  <p className="text-2xl font-bold text-green-600">{kpis.closedTickets}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard