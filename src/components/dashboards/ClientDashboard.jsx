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
            <h3 className="text-lg font-medium text-gray-900">Acceso Requerido</h3>
          </div>
          <p className="text-gray-700">Debes iniciar sesión para ver tu dashboard.</p>
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
            <h3 className="text-lg font-medium text-gray-900">Error al cargar el dashboard</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={loadClientDashboardData}
            className="glass-button px-4 py-2 rounded-xl text-gray-900 font-medium bg-red-100 hover:bg-red-200 transition-all duration-200 flex items-center space-x-2"
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
        <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500/8 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-emerald-500/8 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <AlingUPLogo size="md" variant="dark" animated />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  ¡Hola, {user?.profile?.nombre_completo?.split(' ')[0] || 'Usuario'}!
                </h1>
                <p className="text-gray-700">
                  Bienvenido a tu centro de control personal
                </p>
              </div>
            </div>
            <button 
              onClick={loadClientDashboardData}
              disabled={isLoading}
              className="glass-button px-6 py-3 rounded-2xl text-gray-900 font-medium bg-blue-100 hover:bg-blue-200 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Ticket className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{kpis?.totalTickets || 0}</p>
              <p className="text-gray-600 text-sm">Total Tickets</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{kpis?.openTickets || 0}</p>
              <p className="text-gray-600 text-sm">En Progreso</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{kpis?.closedTickets || 0}</p>
              <p className="text-gray-600 text-sm">Resueltos</p>
            </div>
            <div className="glass-morphism rounded-2xl p-4 text-center">
              <Star className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600 text-sm">Satisfacción</p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-emerald-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Crear Ticket</h3>
                  <p className="text-gray-700 text-sm">Nuevo soporte técnico</p>
                </div>
              </div>
              <p className="text-gray-800 mb-4">
                ¿Necesitas ayuda? Crea un ticket y nuestro equipo te asistirá de inmediato
              </p>
              <div className="flex items-center text-blue-700 font-medium group-hover:text-blue-800 transition-colors">
                <span>Comenzar ahora</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-10 h-10 text-amber-600" />
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
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mis Tickets</h3>
                  <p className="text-gray-700 text-sm">Historial completo</p>
                </div>
              </div>
              <p className="text-gray-800 mb-4">
                Revisa el estado y progreso de todos tus tickets de soporte
              </p>
              <div className="flex items-center text-emerald-700 font-medium group-hover:text-emerald-800 transition-colors">
                <span>Ver todos</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-emerald-600" />
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
              <p className="text-gray-700 text-sm font-medium mb-1">Mis Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : (kpis?.totalTickets || 0)}
              </p>
              <p className="text-gray-600 text-xs">Total creados</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-300 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-blue-700">+12% este mes</span>
          </div>
        </GlassCard>

        <GlassCard variant="warning" className="animate-slide-up group" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : (kpis?.openTickets || 0)}
              </p>
              <p className="text-gray-600 text-xs">Tickets activos</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-yellow-300 text-sm">
            <Target className="w-4 h-4 mr-1" />
            <span className="text-amber-700">Tiempo promedio: 2.5h</span>
          </div>
        </GlassCard>

        <GlassCard variant="success" className="animate-slide-up group" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium mb-1">Resueltos</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : (kpis?.closedTickets || 0)}
              </p>
              <p className="text-gray-600 text-xs">Completados</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-emerald-700 text-sm">
            <Star className="w-4 h-4 mr-1" />
            <span>98% satisfacción</span>
          </div>
        </GlassCard>

        <GlassCard variant="error" className="animate-slide-up group" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium mb-1">Urgentes</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? '...' : (kpis?.urgentTickets || 0)}
              </p>
              <p className="text-gray-600 text-xs">Alta prioridad</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-red-700 text-sm">
            <Zap className="w-4 h-4 mr-1" />
            <span>Respuesta inmediata</span>
          </div>
        </GlassCard>
      </div>

      {/* Recent Ticket Activity - Redesigned */}
      <GlassCard className="animate-slide-up relative overflow-hidden" style={{animationDelay: '0.7s'}}>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/5 to-blue-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 glass-strong rounded-3xl flex items-center justify-center group">
                <Activity className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Actividad Reciente</h3>
                <p className="text-gray-600 text-sm">Tus últimos tickets y actualizaciones</p>
              </div>
            </div>
            <button
              onClick={handleViewAllTickets}
              className="glass-button px-6 py-3 rounded-2xl text-gray-800 hover:text-gray-900 font-medium bg-gradient-to-r from-blue-50 to-emerald-50 hover:from-blue-100 hover:to-emerald-100 transition-all duration-300 flex items-center space-x-2 group"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {recentTickets.length === 0 ? (
            /* Empty State - Enhanced */
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 glass-strong rounded-full flex items-center justify-center mx-auto mb-4 group">
                  <Ticket className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">¡Comienza tu primera solicitud!</h4>
              <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
                No tienes tickets recientes. Crea tu primer ticket y nuestro equipo experto te ayudará de inmediato.
              </p>
              <button
                onClick={handleCreateTicket}
                className="glass-button px-8 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-blue-100 to-emerald-100 hover:from-blue-200 hover:to-emerald-200 transition-all duration-300 flex items-center space-x-3 mx-auto group shadow-lg hover:shadow-xl"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                <span>Crear Mi Primer Ticket</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          ) : (
            /* Tickets List - Enhanced */
            <div className="space-y-3">
              {recentTickets.map((ticket, index) => (
                <div 
                  key={ticket.id}
                  className="group relative"
                  style={{animationDelay: `${0.8 + index * 0.1}s`}}
                >
                  {/* Modern Ticket Card */}
                  <div 
                    className="glass-strong rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up border border-white/50 hover:border-white/70"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 glass-morphism rounded-xl flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-700 transition-colors">
                            {ticket.titulo}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            #{ticket.ticket_number || `T-${ticket.id}`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        ticket.estado === 'abierto' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        ticket.estado === 'en_progreso' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        ticket.estado === 'vobo' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {ticket.estado === 'abierto' ? 'Abierto' :
                         ticket.estado === 'en_progreso' ? 'En Progreso' :
                         ticket.estado === 'vobo' ? 'VoBo' : 'Cerrado'}
                      </div>
                    </div>

                    {/* Ticket Description */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                      {ticket.descripcion}
                    </p>

                    {/* Ticket Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Priority */}
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            ticket.prioridad === 'urgente' ? 'bg-red-500' :
                            ticket.prioridad === 'alta' ? 'bg-orange-500' :
                            ticket.prioridad === 'media' ? 'bg-blue-500' :
                            'bg-emerald-500'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-600 capitalize">
                            {ticket.prioridad}
                          </span>
                        </div>
                        
                        {/* Time */}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                        <span className="text-sm font-medium mr-2">Ver detalles</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Analytics Charts - Redesigned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tickets by State - Enhanced Donut Chart */}
        <GlassCard className="animate-slide-up relative overflow-hidden" style={{animationDelay: '1s'}}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/8 to-indigo-500/8 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-500/6 to-emerald-500/6 rounded-full blur-lg"></div>
          
          <div className="relative z-10">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 glass-strong rounded-3xl flex items-center justify-center group">
                  <BarChart3 className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Estado de Mis Tickets</h3>
                  <p className="text-gray-600 text-sm">Distribución por estado actual</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{kpis?.totalTickets || 0}</p>
                <p className="text-gray-600 text-xs">Total</p>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
              {getStateChartData().length > 0 ? (
                <div className="flex flex-col items-center">
                  <DonutChart
                    data={getStateChartData()}
                    title=""
                    centerText="Total"
                    height={280}
                  />
                  
                  {/* Legend - Enhanced */}
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                    {getStateChartData().map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 glass-subtle rounded-xl">
                        <div className={`w-3 h-3 rounded-full ${
                          item.name === 'Abierto' ? 'bg-blue-500' :
                          item.name === 'En Progreso' ? 'bg-amber-500' :
                          item.name === 'VoBo' ? 'bg-emerald-500' :
                          'bg-slate-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.value} tickets</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Sin datos disponibles</h4>
                  <p className="text-gray-600 text-sm">Crea tu primer ticket para ver las estadísticas</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Evolution Chart - Enhanced Line Chart */}
        <GlassCard className="animate-slide-up relative overflow-hidden" style={{animationDelay: '1.1s'}}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/8 to-blue-500/8 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-18 h-18 bg-gradient-to-tr from-emerald-500/6 to-indigo-500/6 rounded-full blur-lg"></div>
          
          <div className="relative z-10">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 glass-strong rounded-3xl flex items-center justify-center group">
                  <TrendingUp className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Evolución de Mis Tickets</h3>
                  <p className="text-gray-600 text-sm">Tendencia en los últimos días</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Tendencia</span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
              {ticketEvolution.length > 0 ? (
                <div>
                  <LineChart
                    data={ticketEvolution}
                    title=""
                    color="#10b981"
                    height={280}
                  />
                  
                  {/* Stats Summary */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 glass-subtle rounded-xl">
                      <p className="text-lg font-bold text-gray-900">
                        {Math.max(...ticketEvolution.map(d => d.tickets || 0))}
                      </p>
                      <p className="text-xs text-gray-600">Pico máximo</p>
                    </div>
                    <div className="text-center p-3 glass-subtle rounded-xl">
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(ticketEvolution.reduce((acc, d) => acc + (d.tickets || 0), 0) / ticketEvolution.length)}
                      </p>
                      <p className="text-xs text-gray-600">Promedio</p>
                    </div>
                    <div className="text-center p-3 glass-subtle rounded-xl">
                      <p className="text-lg font-bold text-gray-900">
                        {ticketEvolution[ticketEvolution.length - 1]?.tickets || 0}
                      </p>
                      <p className="text-xs text-gray-600">Más reciente</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Sin historial disponible</h4>
                  <p className="text-gray-600 text-sm">Los datos de evolución aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Performance Metrics */}
      {kpis?.avgResolutionTime > 0 && (
        <GlassCard className="animate-slide-up" style={{animationDelay: '1.2s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Métricas de Rendimiento</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatResolutionTime(kpis.avgResolutionTime)}
              </p>
              <p className="text-gray-600 text-xs mt-1">de resolución</p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Tickets Resueltos</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.closedTickets}</p>
              <p className="text-gray-600 text-xs mt-1">completados</p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <Star className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Satisfacción</p>
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600 text-xs mt-1">calificación promedio</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default ClientDashboard