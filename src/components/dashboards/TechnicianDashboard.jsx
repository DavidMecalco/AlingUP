import { useState, useEffect } from 'react'
import { DonutChart, LineChart } from './charts'
import KPICard from './KPICard'
import KanbanBoard from '../tickets/KanbanBoard'
import analyticsService from '../../services/analyticsService'
import { useAuth } from '../../hooks/useAuth'

/**
 * Technician dashboard view with Kanban board as primary interface
 * Shows workload summary and personal performance metrics
 * @returns {JSX.Element}
 */
const TechnicianDashboard = () => {
  const { user } = useAuth()
  const [kpis, setKpis] = useState(null)
  const [ticketEvolution, setTicketEvolution] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [kanbanFilters, setKanbanFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadTechnicianDashboardData()
    }
  }, [user?.id])

  const loadTechnicianDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const technicianId = user.id
      const filters = {
        tecnicos: [technicianId]
      }

      // Load technician-specific dashboard data
      const [
        kpisResult,
        evolutionResult
      ] = await Promise.all([
        analyticsService.getDashboardKPIs(filters),
        analyticsService.getTicketEvolution(filters, 'week')
      ])

      // Handle KPIs
      if (kpisResult.error) {
        throw new Error(kpisResult.error.message)
      }
      setKpis(kpisResult.data)

      // Handle evolution data
      if (evolutionResult.error) {
        console.error('Error loading evolution data:', evolutionResult.error)
      } else {
        setTicketEvolution(evolutionResult.data || [])
      }

    } catch (error) {
      console.error('Error loading technician dashboard data:', error)
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

  const calculatePerformanceMetrics = () => {
    if (!kpis) return {}

    const totalAssigned = kpis.totalTickets
    const resolved = kpis.closedTickets
    const resolutionRate = totalAssigned > 0 ? (resolved / totalAssigned * 100) : 0
    const avgResolutionTime = kpis.avgResolutionTime || 0

    // Performance rating based on resolution rate and time
    let performanceRating = 'Excelente'
    if (resolutionRate < 70 || avgResolutionTime > 72) {
      performanceRating = 'Necesita Mejora'
    } else if (resolutionRate < 85 || avgResolutionTime > 48) {
      performanceRating = 'Bueno'
    } else if (resolutionRate < 95 || avgResolutionTime > 24) {
      performanceRating = 'Muy Bueno'
    }

    return {
      resolutionRate,
      performanceRating,
      totalAssigned,
      resolved
    }
  }

  const handleQuickFilter = (filterType, value) => {
    setKanbanFilters(prev => ({
      ...prev,
      [filterType]: value ? [value] : []
    }))
  }

  const clearFilters = () => {
    setKanbanFilters({})
    setSearchTerm('')
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
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
            onClick={loadTechnicianDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const performanceMetrics = calculatePerformanceMetrics()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard de Técnico</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.profile?.nombre_completo || user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {showMetrics ? 'Ocultar Métricas' : 'Ver Métricas'}
          </button>
          <button 
            onClick={loadTechnicianDashboardData}
            disabled={isLoading}
            className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Workload Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Mis Tickets"
          value={kpis?.totalTickets || 0}
          subtitle="Total asignados"
          icon="📋"
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
          title="Completados"
          value={kpis?.closedTickets || 0}
          subtitle="Tickets resueltos"
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

      {/* Quick Filters for Kanban */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Filtros Rápidos</h3>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
          
          {/* Priority Filter */}
          <div>
            <select
              onChange={(e) => handleQuickFilter('prioridades', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              onChange={(e) => handleQuickFilter('estados', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_progreso">En Progreso</option>
              <option value="vobo">VoBo</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Primary Kanban Board Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="h-[600px]">
          <KanbanBoard 
            filters={{
              ...kanbanFilters,
              tecnicos: [user.id] // Only show tickets assigned to current technician
            }}
            searchTerm={searchTerm}
          />
        </div>
      </div>

      {/* Performance Metrics (Collapsible) */}
      {showMetrics && (
        <>
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard
              title="Tasa de Resolución"
              value={`${Math.round(calculatePerformanceMetrics().resolutionRate || 0)}%`}
              subtitle="Porcentaje de resolución"
              icon="📊"
              color="purple"
              isLoading={isLoading}
            />
            <KPICard
              title="Tiempo Promedio"
              value={kpis?.avgResolutionTime > 0 ? formatResolutionTime(kpis.avgResolutionTime) : 'N/A'}
              subtitle="Tiempo de resolución"
              icon="⏱️"
              color="fuchsia"
              isLoading={isLoading}
            />
            <KPICard
              title="Evaluación"
              value={calculatePerformanceMetrics().performanceRating}
              subtitle="Rendimiento general"
              icon="⭐"
              color="yellow"
              isLoading={isLoading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets by State - Donut Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <DonutChart
                data={getStateChartData()}
                title="Mis Tickets por Estado"
                centerText="Total"
                height={300}
              />
            </div>

            {/* Evolution Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <LineChart
                data={ticketEvolution}
                title="Evolución de Mis Tickets"
                color="#8b5cf6"
                height={300}
              />
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{calculatePerformanceMetrics().totalAssigned}</div>
                <div className="text-sm text-gray-600">Tickets Asignados</div>
              </div>
              <div className="text-center bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{calculatePerformanceMetrics().resolved}</div>
                <div className="text-sm text-gray-600">Tickets Resueltos</div>
              </div>
              <div className="text-center bg-fuchsia-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-fuchsia-600">{Math.round(calculatePerformanceMetrics().resolutionRate)}%</div>
                <div className="text-sm text-gray-600">Tasa de Éxito</div>
              </div>
              <div className="text-center bg-yellow-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600">
                  {kpis?.avgResolutionTime > 0 ? formatResolutionTime(kpis.avgResolutionTime) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Tiempo Promedio</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TechnicianDashboard