import { useState, useEffect } from 'react'
import { DonutChart, BarChart, LineChart } from './charts'
import KPICard from './KPICard'
import GlassCard from '../common/GlassCard'
import analyticsService from '../../services/analyticsService'
import { Ticket, CheckCircle, AlertTriangle, Clock, TrendingUp, RefreshCw } from 'lucide-react'

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
        <GlassCard variant="error" className="animate-slide-in">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-medium text-white">Error al cargar el dashboard</h3>
          </div>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="glass-button px-4 py-2 rounded-xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Reintentar
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <GlassCard className="animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
            <p className="text-white/70">Resumen general del sistema de tickets</p>
          </div>
          <button 
            onClick={loadDashboardData}
            disabled={isLoading}
            className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard variant="primary" className="animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Total de Tickets</p>
              <p className="text-3xl font-bold text-white mt-1">
                {isLoading ? '...' : (kpis?.totalTickets || 0)}
              </p>
              <p className="text-white/60 text-xs mt-1">Todos los tickets</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="success" className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Abiertos</p>
              <p className="text-3xl font-bold text-white mt-1">
                {isLoading ? '...' : (kpis?.openTickets || 0)}
              </p>
              <p className="text-white/60 text-xs mt-1">Pendientes de resolución</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="primary" className="animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Cerrados</p>
              <p className="text-3xl font-bold text-white mt-1">
                {isLoading ? '...' : (kpis?.closedTickets || 0)}
              </p>
              <p className="text-white/60 text-xs mt-1">Resueltos exitosamente</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="error" className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Urgentes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {isLoading ? '...' : (kpis?.urgentTickets || 0)}
              </p>
              <p className="text-white/60 text-xs mt-1">Requieren atención inmediata</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Resolution Time KPI */}
      {kpis?.avgResolutionTime > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard variant="warning" className="animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Tiempo Promedio de Resolución</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {isLoading ? '...' : formatResolutionTime(kpis.avgResolutionTime)}
                </p>
                <p className="text-white/60 text-xs mt-1">Basado en {kpis.closedTickets} tickets cerrados</p>
              </div>
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="success" className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Tickets Resueltos Hoy</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {isLoading ? '...' : (resolutionStats?.totalResolved || 0)}
                </p>
                <p className="text-white/60 text-xs mt-1">Tickets cerrados en el período</p>
              </div>
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by State - Donut Chart */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '0.7s'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Tickets por Estado</h3>
          <DonutChart
            data={getStateChartData()}
            title=""
            centerText="Total"
            height={300}
          />
        </GlassCard>

        {/* Tickets by Priority - Donut Chart */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '0.8s'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Tickets por Prioridad</h3>
          <DonutChart
            data={getPriorityChartData()}
            title=""
            centerText="Total"
            height={300}
          />
        </GlassCard>
      </div>

      {/* Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Technician */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '0.9s'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Tickets por Técnico</h3>
          <BarChart
            data={ticketsByTechnician}
            title=""
            color="#8b5cf6"
            height={300}
          />
        </GlassCard>

        {/* Tickets by Client */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '1s'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Top 10 Clientes</h3>
          <BarChart
            data={ticketsByClient}
            title=""
            color="#d946ef"
            height={300}
          />
        </GlassCard>
      </div>

      {/* Evolution Chart */}
      <GlassCard className="animate-slide-up" style={{animationDelay: '1.1s'}}>
        <h3 className="text-lg font-semibold text-white mb-4">Evolución de Tickets (Últimas Semanas)</h3>
        <LineChart
          data={ticketEvolution}
          title=""
          color="#8b5cf6"
          height={300}
        />
      </GlassCard>

      {/* Resolution Time by Priority */}
      {resolutionStats?.byPriority && (
        <GlassCard className="animate-slide-up" style={{animationDelay: '1.2s'}}>
          <h3 className="text-lg font-semibold text-white mb-6">Tiempo de Resolución por Prioridad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(resolutionStats.byPriority).map(([priority, stats]) => (
              <div key={priority} className="glass-morphism rounded-2xl p-4">
                <h4 className="font-medium text-white/90 capitalize mb-2">{priority}</h4>
                <p className="text-2xl font-bold text-purple-300">
                  {stats.count > 0 ? formatResolutionTime(stats.avgHours) : 'N/A'}
                </p>
                <p className="text-sm text-white/60">{stats.count} tickets</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default AdminDashboard