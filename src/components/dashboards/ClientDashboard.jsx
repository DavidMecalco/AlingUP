import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DonutChart, LineChart } from './charts'
import KPICard from './KPICard'
import TicketCard from '../tickets/TicketCard'
import GlassCard from '../common/GlassCard'
import AlingUPLogo from '../common/AlingUPLogo'
import analyticsService from '../../services/analyticsService'
import ticketService from '../../services/ticketService'
import { useAuth } from '../../hooks/useAuth'
import { 
  Plus, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Zap,
  ArrowRight,
  BarChart3,
  Activity,
  Star,
  Target
} from 'lucide-react'
import '../../styles/glass.css'

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
            onClick={loadClientDashboardData}
            className="glass-button px-4 py-2 rounded-xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Hero Header */}
      <GlassCard className="animate-slide-in relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <AlingUPLogo size="md" variant="light" animated />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  ¡Hola, {user?.profile?.nombre_completo?.split(' ')[0] || 'Usuario'}!
                </h1>
                <p className="text-white/70">
                  Bienvenido a tu centro de control personal
                </p>
              </div>
            </div>
            <button 
              onClick={loadClientDashboardData}
              disabled={isLoading}
              className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Ticket className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{kpis?.totalTickets || 0}</p>
              <p className="text-white/60 text-sm">Total Tickets</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{kpis?.openTickets || 0}</p>
              <p className="text-white/60 text-sm">En Progreso</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{kpis?.closedTickets || 0}</p>
              <p className="text-white/60 text-sm">Resueltos</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-white/60 text-sm">Satisfacción</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Ticket - Primary CTA */}
        <GlassCard 
          variant="primary" 
          className="animate-slide-up cursor-pointer group relative overflow-hidden"
          onClick={handleCreateTicket}
          style={{animationDelay: '0.1s'}}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Crear Ticket</h3>
                  <p className="text-white/70 text-sm">Nuevo soporte técnico</p>
                </div>
              </div>
              <p className="text-white/80 mb-4">
                ¿Necesitas ayuda? Crea un ticket y nuestro equipo te asistirá de inmediato
              </p>
              <div className="flex items-center text-purple-300 font-medium group-hover:text-purple-200 transition-colors">
                <span>Comenzar ahora</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* View All Tickets */}
        <GlassCard 
          variant="default" 
          className="animate-slide-up cursor-pointer group"
          onClick={handleViewAllTickets}
          style={{animationDelay: '0.2s'}}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Mis Tickets</h3>
                  <p className="text-white/70 text-sm">Historial completo</p>
                </div>
              </div>
              <p className="text-white/80 mb-4">
                Revisa el estado y progreso de todos tus tickets de soporte
              </p>
              <div className="flex items-center text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
                <span>Ver todos</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Detailed KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard variant="primary" className="animate-slide-up group" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Mis Tickets</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.totalTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Total creados</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Ticket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-300 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% este mes</span>
          </div>
        </GlassCard>

        <GlassCard variant="warning" className="animate-slide-up group" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.openTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Tickets activos</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-yellow-300 text-sm">
            <Target className="w-4 h-4 mr-1" />
            <span>Tiempo promedio: 2.5h</span>
          </div>
        </GlassCard>

        <GlassCard variant="success" className="animate-slide-up group" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Resueltos</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '...' : (kpis?.closedTickets || 0)}
              </p>
              <p className="text-white/60 text-xs">Completados</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-300 text-sm">
            <Star className="w-4 h-4 mr-1" />
            <span>98% satisfacción</span>
          </div>
        </GlassCard>

        <GlassCard variant="error" className="animate-slide-up group" style={{animationDelay: '0.6s'}}>
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
            <Zap className="w-4 h-4 mr-1" />
            <span>Respuesta inmediata</span>
          </div>
        </GlassCard>
      </div>

      {/* Recent Ticket Activity */}
      <GlassCard className="animate-slide-up" style={{animationDelay: '0.7s'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Actividad Reciente</h3>
          </div>
          <button
            onClick={handleViewAllTickets}
            className="glass-button px-4 py-2 rounded-xl text-white/80 hover:text-white text-sm font-medium bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-white/40" />
            </div>
            <h4 className="text-white font-medium mb-2">No tienes tickets recientes</h4>
            <p className="text-white/60 text-sm mb-6">Crea tu primer ticket para comenzar a recibir soporte</p>
            <button
              onClick={handleCreateTicket}
              className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Ticket</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTickets.map((ticket, index) => (
              <div 
                key={ticket.id}
                className="glass-morphism rounded-2xl p-4 hover:bg-white/15 transition-all duration-200 cursor-pointer animate-slide-up"
                onClick={() => handleTicketClick(ticket)}
                style={{animationDelay: `${0.8 + index * 0.1}s`}}
              >
                <TicketCard
                  ticket={ticket}
                  onClick={handleTicketClick}
                  showClient={false}
                  showTechnician={true}
                />
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by State - Donut Chart */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '1s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Estado de Mis Tickets</h3>
          </div>
          <DonutChart
            data={getStateChartData()}
            title=""
            centerText="Total"
            height={300}
          />
        </GlassCard>

        {/* Evolution Chart */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '1.1s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Evolución de Mis Tickets</h3>
          </div>
          <LineChart
            data={ticketEvolution}
            title=""
            color="#d946ef"
            height={300}
          />
        </GlassCard>
      </div>

      {/* Performance Metrics */}
      {kpis?.avgResolutionTime > 0 && (
        <GlassCard className="animate-slide-up" style={{animationDelay: '1.2s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Métricas de Rendimiento</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white/70 mb-1">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-white">
                {formatResolutionTime(kpis.avgResolutionTime)}
              </p>
              <p className="text-white/60 text-xs mt-1">de resolución</p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white/70 mb-1">Tickets Resueltos</p>
              <p className="text-2xl font-bold text-white">{kpis.closedTickets}</p>
              <p className="text-white/60 text-xs mt-1">completados</p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-white/70 mb-1">Satisfacción</p>
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-white/60 text-xs mt-1">calificación promedio</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default ClientDashboard