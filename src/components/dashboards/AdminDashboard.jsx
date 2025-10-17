import { useState, useEffect } from 'react'
import { DonutChart, BarChart, LineChart } from './charts'
import KPICard from './KPICard'
import analyticsService from '../../services/analyticsService'

/**
 * Main admin dashboard component with KPI cards and summary metrics
 * Displays comprehensive analytics for administrators
 * @returns {JSX.Element}
 */
const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null)
  const [ticketsByTechnician, setTicketsByTechnician] = useState([])
  const [ticketsByClient, setTicketsByClient] = useState([])
  const [ticketEvolution, setTicketEvolution] = useState([])
  const [resolutionStats, setResolutionStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load all dashboard data in parallel
      const [
        kpisResult,
        technicianResult,
        clientResult,
        evolutionResult,
        resolutionResult
      ] = await Promise.all([
        analyticsService.getDashboardKPIs(),
        analyticsService.getTicketsByTechnician(),
        analyticsService.getTicketsByClient(),
        analyticsService.getTicketEvolution({}, 'week'),
        analyticsService.getResolutionTimeStats()
      ])

      // Handle KPIs
      if (kpisResult.error) {
        throw new Error(kpisResult.error.message)
      }
      setKpis(kpisResult.data)

      // Handle technician data
      if (technicianResult.error) {
        console.error('Error loading technician data:', technicianResult.error)
      } else {
        setTicketsByTechnician(technicianResult.data || [])
      }

      // Handle client data
      if (clientResult.error) {
        console.error('Error loading client data:', clientResult.error)
      } else {
        setTicketsByClient(clientResult.data || [])
      }

      // Handle evolution data
      if (evolutionResult.error) {
        console.error('Error loading evolution data:', evolutionResult.error)
      } else {
        setTicketEvolution(evolutionResult.data || [])
      }

      // Handle resolution stats
      if (resolutionResult.error) {
        console.error('Error loading resolution stats:', resolutionResult.error)
      } else {
        setResolutionStats(resolutionResult.data)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
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

  const getPriorityChartData = () => {
    if (!kpis?.ticketsByPriority) return []
    
    return kpis.ticketsByPriority.map(item => ({
      name: item.label || item.name,
      value: item.value
    }))
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Resumen general del sistema de tickets</p>
        </div>
        <button 
          onClick={loadDashboardData}
          disabled={isLoading}
          className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Tickets"
          value={kpis?.totalTickets || 0}
          subtitle="Todos los tickets"
          icon="🎫"
          color="blue"
          isLoading={isLoading}
        />
        <KPICard
          title="Tickets Abiertos"
          value={kpis?.openTickets || 0}
          subtitle="Pendientes de resolución"
          icon="📋"
          color="green"
          isLoading={isLoading}
        />
        <KPICard
          title="Tickets Cerrados"
          value={kpis?.closedTickets || 0}
          subtitle="Resueltos exitosamente"
          icon="✅"
          color="purple"
          isLoading={isLoading}
        />
        <KPICard
          title="Tickets Urgentes"
          value={kpis?.urgentTickets || 0}
          subtitle="Requieren atención inmediata"
          icon="🚨"
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Resolution Time KPI */}
      {kpis?.avgResolutionTime > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Tiempo Promedio de Resolución"
            value={formatResolutionTime(kpis.avgResolutionTime)}
            subtitle={`Basado en ${kpis.closedTickets} tickets cerrados`}
            icon="⏱️"
            color="fuchsia"
            isLoading={isLoading}
          />
          <KPICard
            title="Tickets Resueltos Hoy"
            value={resolutionStats?.totalResolved || 0}
            subtitle="Tickets cerrados en el período"
            icon="📈"
            color="green"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by State - Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DonutChart
            data={getStateChartData()}
            title="Tickets por Estado"
            centerText="Total"
            height={300}
          />
        </div>

        {/* Tickets by Priority - Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DonutChart
            data={getPriorityChartData()}
            title="Tickets por Prioridad"
            centerText="Total"
            height={300}
          />
        </div>
      </div>

      {/* Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Technician */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <BarChart
            data={ticketsByTechnician}
            title="Tickets por Técnico"
            color="#8b5cf6"
            height={300}
          />
        </div>

        {/* Tickets by Client */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <BarChart
            data={ticketsByClient}
            title="Top 10 Clientes"
            color="#d946ef"
            height={300}
          />
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart
          data={ticketEvolution}
          title="Evolución de Tickets (Últimas Semanas)"
          color="#8b5cf6"
          height={300}
        />
      </div>

      {/* Resolution Time by Priority */}
      {resolutionStats?.byPriority && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiempo de Resolución por Prioridad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(resolutionStats.byPriority).map(([priority, stats]) => (
              <div key={priority} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize">{priority}</h4>
                <p className="text-2xl font-bold text-fuchsia-600">
                  {stats.count > 0 ? formatResolutionTime(stats.avgHours) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">{stats.count} tickets</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard