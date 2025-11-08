import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTicketStats } from '../hooks/useTicketStats'
import { useNavigate } from 'react-router-dom'
import TicketList from '../components/tickets/TicketList'
import GlassCard from '../components/common/GlassCard'
import { TICKET_STATES, TICKET_PRIORITIES } from '../utils/constants'
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  EyeOff,
  TrendingUp,
  AlertCircle,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Activity,
  RefreshCw,
  ArrowUpRight,
  Zap,
  Target,
  BarChart3
} from 'lucide-react'
import '../styles/glass.css'

const Tickets = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { total, pendientes, resueltos, loading: statsLoading, refresh } = useTicketStats()
  
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Determine what to show based on user role
  const showClient = user?.profile?.rol !== 'cliente'
  const showTechnician = user?.profile?.rol === 'admin'
  const isClient = user?.profile?.rol === 'cliente'

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    setFilters(prev => ({
      ...prev,
      search: value.trim() || undefined
    }))
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      
      if (value === '' || value === null || value === undefined) {
        delete newFilters[filterType]
      } else {
        newFilters[filterType] = Array.isArray(value) ? value : [value]
      }
      
      return newFilters
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  // Calculate satisfaction rate
  const satisfactionRate = total > 0 ? Math.round((resueltos / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 border-b border-white/10">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    {isClient ? 'Mis Tickets' : 'Centro de Tickets'}
                  </h1>
                  <p className="text-blue-200 text-lg mt-1 font-medium">
                    {isClient 
                      ? 'Gestiona tus solicitudes de soporte'
                      : 'Panel de administración y seguimiento'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="text-white/90 font-medium">
                    {statsLoading ? 'Actualizando...' : 'En tiempo real'}
                  </span>
                </div>
                <div className="h-4 w-px bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-white/90 font-medium">
                    {satisfactionRate}% Satisfacción
                  </span>
                </div>
                <div className="h-4 w-px bg-white/20"></div>
                <button
                  onClick={refresh}
                  disabled={statsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-white ${statsLoading ? 'animate-spin' : ''}`} />
                  <span className="text-white font-medium">Actualizar</span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            {(isClient || user?.profile?.rol === 'admin') && (
              <button
                onClick={() => navigate('/tickets/create')}
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 flex items-center gap-3"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Ticket</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Tickets */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <Zap className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total de Tickets</p>
                <div className="flex items-baseline gap-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                  ) : (
                    <>
                      <h3 className="text-5xl font-bold text-gray-900">{total}</h3>
                      <span className="text-lg text-gray-500 font-medium">tickets</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {isClient ? 'Tus solicitudes' : 'En el sistema'}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Tickets */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-amber-500 opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">En Proceso</p>
                <div className="flex items-baseline gap-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                  ) : (
                    <>
                      <h3 className="text-5xl font-bold text-gray-900">{pendientes}</h3>
                      <span className="text-lg text-gray-500 font-medium">activos</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Requieren atención
                </p>
              </div>
            </div>
          </div>

          {/* Resolved Tickets */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <Target className="w-6 h-6 text-emerald-500 opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Resueltos</p>
                <div className="flex items-baseline gap-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                  ) : (
                    <>
                      <h3 className="text-5xl font-bold text-gray-900">{resueltos}</h3>
                      <span className="text-lg text-gray-500 font-medium">completos</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Satisfacción garantizada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Buscar Tickets</h2>
                <p className="text-gray-600 font-medium">Encuentra lo que necesitas rápidamente</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Buscar por título, descripción o ID del ticket..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-medium text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilters(prev => {
                        const newFilters = { ...prev }
                        delete newFilters.search
                        return newFilters
                      })
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    showFilters 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showFilters ? <EyeOff className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <span className="bg-white text-blue-600 text-xs px-2.5 py-1 rounded-full font-bold">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-4 rounded-2xl font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-300 flex items-center gap-3"
                  >
                    <X className="w-5 h-5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Estado
                    </label>
                    <select
                      onChange={(e) => handleFilterChange('estados', e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                      value={filters.estados?.[0] || ''}
                    >
                      <option value="">Todos los estados</option>
                      {Object.entries(TICKET_STATES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Prioridad
                    </label>
                    <select
                      onChange={(e) => handleFilterChange('prioridades', e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                      value={filters.prioridades?.[0] || ''}
                    >
                      <option value="">Todas las prioridades</option>
                      {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Desde
                    </label>
                    <input
                      type="date"
                      onChange={(e) => handleFilterChange('fecha_desde', e.target.value ? new Date(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Hasta
                    </label>
                    <input
                      type="date"
                      onChange={(e) => handleFilterChange('fecha_hasta', e.target.value ? new Date(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tickets List Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isClient ? 'Mis Tickets' : 'Todos los Tickets'}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {isClient 
                      ? 'Gestiona tus solicitudes de soporte'
                      : 'Vista completa del sistema'
                    }
                  </p>
                </div>
              </div>
            </div>

            <TicketList
              filters={filters}
              showClient={showClient}
              showTechnician={showTechnician}
              emptyMessage={
                isClient 
                  ? "No tienes tickets creados"
                  : "No se encontraron tickets"
              }
              emptyDescription={
                isClient
                  ? "Crea tu primer ticket para solicitar asistencia técnica"
                  : "Los tickets aparecerán aquí cuando se creen"
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tickets