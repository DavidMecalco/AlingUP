import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import TicketList from '../components/tickets/TicketList'
import { TICKET_STATES, TICKET_PRIORITIES } from '../utils/constants'

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
    <AuthenticatedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.profile?.rol === 'cliente' ? 'Mis Tickets' : 'Gestión de Tickets'}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {user?.profile?.rol === 'cliente' 
                    ? 'Revisa el estado de tus solicitudes de soporte'
                    : 'Administra y da seguimiento a todos los tickets'
                  }
                </p>
              </div>
              
              {canCreateTickets && (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/tickets/create')}
                    className="btn-primary flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar tickets por título, descripción o ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary flex items-center ${showFilters ? 'bg-gray-200' : ''}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('estados', e.target.value)}
                    className="input-field text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    onChange={(e) => handleFilterChange('prioridades', e.target.value)}
                    className="input-field text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_desde', e.target.value ? new Date(e.target.value) : null)}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('fecha_hasta', e.target.value ? new Date(e.target.value) : null)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tickets List */}
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
        </div>
      </div>
    </AuthenticatedRoute>
  )
}

export default Tickets