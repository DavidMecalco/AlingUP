import React, { useState } from 'react'
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
  Eye,
  EyeOff,
  BarChart3,
  Users,
  Clock,
  Target
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
    <div className="min-h-screen p-6 space-y-8">
        {/* Hero Header */}
        <GlassCard className="animate-slide-in relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center">
                  {user?.profile?.rol === 'cliente' ? (
                    <Ticket className="w-8 h-8 text-blue-400" />
                  ) : (
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {user?.profile?.rol === 'cliente' ? 'Mis Tickets' : 'Gestión de Tickets'}
                  </h1>
                  <p className="text-white/70">
                    {user?.profile?.rol === 'cliente' 
                      ? 'Revisa el estado de tus solicitudes de soporte'
                      : 'Administra y da seguimiento a todos los tickets'
                    }
                  </p>
                </div>
              </div>
              
              {canCreateTickets && (
                <button
                  onClick={() => navigate('/tickets/create')}
                  className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nuevo Ticket</span>
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <Ticket className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">Total</p>
                <p className="text-white/60 text-sm">Todos los tickets</p>
              </div>
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-medium">Pendientes</p>
                <p className="text-white/60 text-sm">En proceso</p>
              </div>
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Resueltos</p>
                <p className="text-white/60 text-sm">Completados</p>
              </div>
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Asignados</p>
                <p className="text-white/60 text-sm">En trabajo</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Search and Filters */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Buscar y Filtrar</h3>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Buscar tickets por título, descripción o ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`glass-button px-4 py-3 rounded-2xl text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                  showFilters ? 'bg-purple-500/30' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                {showFilters ? <EyeOff className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-purple-500/50 text-white text-xs px-2 py-1 rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="glass-button px-4 py-3 rounded-2xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="glass-morphism rounded-2xl p-6 animate-slide-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Estado
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('estados', e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                    value={filters.estados?.[0] || ''}
                  >
                    <option value="" className="bg-gray-800 text-white">Todos los estados</option>
                    {Object.entries(TICKET_STATES).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-800 text-white">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Prioridad
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('prioridades', e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                    value={filters.prioridades?.[0] || ''}
                  >
                    <option value="" className="bg-gray-800 text-white">Todas las prioridades</option>
                    {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-800 text-white">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_desde', e.target.value ? new Date(e.target.value) : null)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_hasta', e.target.value ? new Date(e.target.value) : null)}
                    className="glass-input w-full px-4 py-3 rounded-2xl text-white bg-white/10 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Tickets List */}
        <GlassCard className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              {user?.profile?.rol === 'cliente' ? 'Mis Tickets' : 'Lista de Tickets'}
            </h3>
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