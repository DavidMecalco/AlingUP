import { useState, useEffect } from 'react'
import { DonutChart, LineChart } from './charts'
import KPICard from './KPICard'
import KanbanBoard from '../tickets/KanbanBoard'
import GlassCard from '../common/GlassCard'
import AlingUPLogo from '../common/AlingUPLogo'
import analyticsService from '../../services/analyticsService'
import { useAuth } from '../../hooks/useAuth'
import { 
  Wrench, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Zap,
  Search,
  Filter,
  X,
  BarChart3,
  Target,
  Award,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react'
import '../../styles/glass.css'

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
        <GlassCard variant="warning" className="animate-slide-in">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-medium text-white">Acceso Requerido</h3>
          </div>
          <p className="text-white/80">Debes iniciar sesión para ver tu dashboard.</p>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <GlassCard variant="error" className="animate-slide-in">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-medium text-white">Error al cargar el dashboard</h3>
          </div>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={loadTechnicianDashboardData}
            className="glass-button px-4 py-2 rounded-xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </GlassCard>
      </div>
    )
  }

  const performanceMetrics = calculatePerformanceMetrics()

  return (
    <div className="p-6 space-y-8">
      {/* Hero Header */}
      <GlassCard className="animate-slide-in relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center">
                <Wrench className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Centro de Trabajo
                </h1>
                <p className="text-white/70">
                  {user?.profile?.nombre_completo || user?.email} - Técnico Especializado
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="glass-button px-4 py-3 rounded-2xl text-white font-medium bg-white/10 hover:bg-white/15 transition-all duration-200 flex items-center space-x-2"
              >
                {showMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showMetrics ? 'Ocultar Métricas' : 'Ver Métricas'}</span>
              </button>
              <button 
                onClick={loadTechnicianDashboardData}
                disabled={isLoading}
                className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-morphism rounded-2xl px-4 py-2 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">{performanceMetrics.performanceRating}</span>
              </div>
              <div className="glass-morphism rounded-2xl px-4 py-2 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">{Math.round(performanceMetrics.resolutionRate || 0)}% Resolución</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Tickets Activos</p>
              <p className="text-2xl font-bold text-white">{kpis?.openTickets || 0}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Workload Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard variant="primary" className="animate-slide-up group" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Mis Tickets</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.totalTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Total asignados</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Ticket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-300 text-sm">
            <Activity className="w-4 h-4 mr-1" />
            <span>Carga de trabajo</span>
          </div>
        </GlassCard>

        <GlassCard variant="warning" className="animate-slide-up group" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.openTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Tickets activos</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-yellow-300 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>Trabajando ahora</span>
          </div>
        </GlassCard>

        <GlassCard variant="success" className="animate-slide-up group" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Completados</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.closedTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Tickets resueltos</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-300 text-sm">
            <Award className="w-4 h-4 mr-1" />
            <span>Éxitos logrados</span>
          </div>
        </GlassCard>

        <GlassCard variant="error" className="animate-slide-up group" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Urgentes</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.urgentTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Alta prioridad</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-red-300 text-sm">
            <Target className="w-4 h-4 mr-1" />
            <span>Atención inmediata</span>
          </div>
        </GlassCard>
      </div>

      {/* Quick Filters for Kanban */}
      <GlassCard className="animate-slide-up" style={{animationDelay: '0.5s'}}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Filtros Rápidos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
            />
          </div>
          
          {/* Priority Filter */}
          <select
            onChange={(e) => handleQuickFilter('prioridades', e.target.value)}
            className="glass-input px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">Todas las prioridades</option>
            <option value="urgente" className="bg-gray-800 text-white">Urgente</option>
            <option value="alta" className="bg-gray-800 text-white">Alta</option>
            <option value="media" className="bg-gray-800 text-white">Media</option>
            <option value="baja" className="bg-gray-800 text-white">Baja</option>
          </select>

          {/* State Filter */}
          <select
            onChange={(e) => handleQuickFilter('estados', e.target.value)}
            className="glass-input px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">Todos los estados</option>
            <option value="abierto" className="bg-gray-800 text-white">Abierto</option>
            <option value="en_progreso" className="bg-gray-800 text-white">En Progreso</option>
            <option value="vobo" className="bg-gray-800 text-white">VoBo</option>
            <option value="cerrado" className="bg-gray-800 text-white">Cerrado</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="glass-button px-4 py-3 rounded-2xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        </div>
      </GlassCard>

      {/* Primary Kanban Board Interface */}
      <GlassCard padding="sm" className="animate-slide-up" style={{animationDelay: '0.6s'}}>
        <div className="flex items-center space-x-3 mb-4 px-4 pt-2">
          <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Tablero Kanban - Mis Tickets</h3>
        </div>
        <div className="h-[600px] rounded-2xl overflow-hidden">
          <KanbanBoard 
            filters={{
              ...kanbanFilters,
              tecnicos: [user.id] // Only show tickets assigned to current technician
            }}
            searchTerm={searchTerm}
          />
        </div>
      </GlassCard>

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