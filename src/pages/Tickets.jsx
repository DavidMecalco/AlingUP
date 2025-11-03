import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TicketList from '../components/tickets/TicketList'
import GlassCard from '../components/common/GlassCard'
import { TICKET_STATES, TICKET_PRIORITIES } from '../utils/constants'
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Calendar,
  Ticket,
  Settings,
  EyeOff,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react'
import '../styles/glass.css'

const Tickets = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Determine what to show based on user role
  const showClient = user?.profile?.rol !== 'cliente'
  const showTechnician = user?.profile?.rol === 'admin'
  const canCreateTickets = user?.profile?.rol === 'cliente' || user?.profile?.rol === 'admin'

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Update filters with search term
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 p-6 space-y-8">
        {/* Hero Header */}
        <GlassCard className="animate-slide-in relative overflow-hidden glass-strong">
          {/* Floating decorative elements */}
          <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
                  {user?.profile?.rol === 'cliente' ? (
                    <Ticket className="w-10 h-10 text-blue-600" />
                  ) : (
                    <BarChart3 className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                    {user?.profile?.rol === 'cliente' ? 'Mis Tickets' : 'Gestión de Tickets'}
                  </h1>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {user?.profile?.rol === 'cliente' 
                      ? 'Revisa el estado de tus solicitudes de soporte técnico'
                      : 'Administra y da seguimiento a todos los tickets del sistema'
                    }
                  </p>
                </div>
              </div>
              
              {canCreateTickets && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/tickets/create')}
                    className="glass-button px-8 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200/50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Ticket</span>
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">572</div>
                <p className="text-gray-900 font-medium mb-1">Total</p>
                <p className="text-gray-600 text-sm">Todos los tickets</p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/30 hover:border-amber-300/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">89</div>
                <p className="text-gray-900 font-medium mb-1">Pendientes</p>
                <p className="text-gray-600 text-sm">En proceso</p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">456</div>
                <p className="text-gray-900 font-medium mb-1">Resueltos</p>
                <p className="text-gray-600 text-sm">Completados</p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">27</div>
                <p className="text-gray-900 font-medium mb-1">Asignados</p>
                <p className="text-gray-600 text-sm">En trabajo</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Enhanced Search and Filters */}
        <GlassCard className="animate-slide-up glass-strong" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Buscar y Filtrar</h3>
              <p className="text-gray-600">Encuentra tickets específicos usando filtros avanzados</p>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-600 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Buscar tickets por título, descripción o ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 transition-all duration-300 text-lg"
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
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`glass-button px-6 py-4 rounded-2xl text-gray-900 font-semibold transition-all duration-300 flex items-center space-x-3 border ${
                  showFilters 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300/50 shadow-lg' 
                    : 'glass-subtle hover:glass border-gray-200/50 hover:border-gray-300/50'
                }`}
              >
                {showFilters ? <EyeOff className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                <span>Filtros Avanzados</span>
                {hasActiveFilters && (
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="glass-button px-6 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border border-red-200/50 transition-all duration-300 flex items-center space-x-3 shadow-lg"
                >
                  <X className="w-5 h-5" />
                  <span>Limpiar Filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Filter Options */}
          {showFilters && (
            <div className="glass-morphism rounded-2xl p-8 animate-slide-in bg-gradient-to-br from-gray-50/50 to-blue-50/30 border border-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* State Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Estado del Ticket
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('estados', e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 transition-all duration-300 font-medium"
                    value={filters.estados?.[0] || ''}
                  >
                    <option value="" className="bg-white text-gray-900">Todos los estados</option>
                    {Object.entries(TICKET_STATES).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white text-gray-900">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Nivel de Prioridad
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('prioridades', e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 transition-all duration-300 font-medium"
                    value={filters.prioridades?.[0] || ''}
                  >
                    <option value="" className="bg-white text-gray-900">Todas las prioridades</option>
                    {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white text-gray-900">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_desde', e.target.value ? new Date(e.target.value) : null)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 transition-all duration-300 font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_hasta', e.target.value ? new Date(e.target.value) : null)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 transition-all duration-300 font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Enhanced Tickets List */}
        <GlassCard className="animate-slide-up glass-strong" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user?.profile?.rol === 'cliente' ? 'Mis Tickets' : 'Lista de Tickets'}
                </h3>
                <p className="text-gray-600">
                  {user?.profile?.rol === 'cliente' 
                    ? 'Todos tus tickets de soporte técnico'
                    : 'Gestiona todos los tickets del sistema'
                  }
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <button className="glass-button px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 transition-colors duration-200">
                <TrendingUp className="w-4 h-4" />
              </button>
              <button className="glass-button px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 transition-colors duration-200">
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <TicketList
            filters={filters}
            showClient={showClient}
            showTechnician={showTechnician}
            emptyMessage={
              user?.profile?.rol === 'cliente' 
                ? "No tienes tickets creados"
                : "No se encontraron tickets"
            }
            emptyDescription={
              user?.profile?.rol === 'cliente'
                ? "Crea tu primer ticket para solicitar asistencia técnica"
                : "Los tickets aparecerán aquí cuando se creen"
            }
          />
        </GlassCard>
      </div>
  )
}

export default Tickets