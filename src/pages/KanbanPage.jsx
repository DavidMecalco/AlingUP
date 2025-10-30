import React, { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import KanbanBoard from '../components/tickets/KanbanBoard'
import SearchBar from '../components/filters/SearchBar'
import FilterPanel from '../components/filters/FilterPanel'
import { useAuth } from '../hooks/useAuth'
import { Kanban, Users, Settings, RefreshCw } from 'lucide-react'

const KanbanPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get initial values from URL parameters
  const initialSearch = searchParams.get('search') || ''
  const initialFilters = {
    estados: searchParams.getAll('estado'),
    prioridades: searchParams.getAll('prioridad'),
    tipos: searchParams.getAll('tipo'),
    clientes: searchParams.getAll('cliente'),
    tecnicos: searchParams.getAll('tecnico')
  }

  // Clean up empty arrays from initial filters
  Object.keys(initialFilters).forEach(key => {
    if (initialFilters[key].length === 0) {
      delete initialFilters[key]
    }
  })

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [filters, setFilters] = useState(initialFilters)
  const [refreshKey, setRefreshKey] = useState(0)

  // Update URL parameters when filters change
  const updateUrlParams = useCallback((newFilters, newSearch) => {
    const params = new URLSearchParams()
    
    if (newSearch) {
      params.set('search', newSearch)
    }

    Object.entries(newFilters).forEach(([key, values]) => {
      if (values && Array.isArray(values) && values.length > 0) {
        const paramKey = key.slice(0, -1) // Remove 's' from end (estados -> estado)
        values.forEach(value => params.append(paramKey, value))
      }
    })

    setSearchParams(params)
  }, [setSearchParams])

  // Handle search changes
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm)
    updateUrlParams(filters, newSearchTerm)
  }, [filters, updateUrlParams])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
    updateUrlParams(newFilters, searchTerm)
  }, [searchTerm, updateUrlParams])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Check if user has access to Kanban board
  const userRole = user?.rol || user?.profile?.rol
  if (!user || (userRole !== 'tecnico' && userRole !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-6">
        <div className="glass-morphism rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 glass-morphism rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
          <p className="text-white/70 mb-6">
            Solo los técnicos y administradores pueden acceder al tablero Kanban.
          </p>
          <div className="glass-morphism rounded-xl p-4 bg-yellow-500/20 border-yellow-400/30">
            <p className="text-yellow-400 text-sm">
              Tu rol actual: <span className="font-semibold">{userRole || 'No definido'}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="glass-morphism rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Kanban className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userRole === 'tecnico' ? 'Mis Tickets' : 'Tablero Kanban'}
                </h1>
                <p className="mt-2 text-white/70">
                  {userRole === 'tecnico' 
                    ? 'Gestiona tus tickets asignados arrastrándolos entre columnas'
                    : 'Vista general de todos los tickets del sistema'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="glass-button p-3 rounded-xl hover:bg-white/20 transition-all duration-200 group"
                title="Actualizar tablero"
              >
                <RefreshCw className="w-5 h-5 text-white/70 group-hover:text-white group-hover:rotate-180 transition-all duration-300" />
              </button>
              <div className="glass-button p-3 rounded-xl">
                <Settings className="w-5 h-5 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-morphism rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearchChange}
                placeholder="Buscar por título, descripción o ID..."
                initialValue={searchTerm}
              />
            </div>
            <div className="flex-shrink-0">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                showClientFilter={userRole === 'admin'}
                showTechnicianFilter={userRole === 'admin'}
                showTypeFilter={true}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="glass-morphism rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/70">Filtros activos:</span>
              {Object.entries(filters).map(([key, values]) => 
                values && Array.isArray(values) && values.map(value => (
                  <span
                    key={`${key}-${value}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium glass-morphism bg-purple-500/30 text-white border border-purple-400/30"
                  >
                    {getFilterLabel(key, value)}
                    <button
                      onClick={() => {
                        const newValues = values.filter(v => v !== value)
                        handleFiltersChange({
                          ...filters,
                          [key]: newValues.length > 0 ? newValues : undefined
                        })
                      }}
                      className="ml-2 text-white/70 hover:text-white transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={() => handleFiltersChange({})}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Limpiar todos
              </button>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="glass-morphism rounded-2xl border border-white/10 p-6" style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
          <KanbanBoard
            key={refreshKey}
            filters={filters}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  )
}

// Helper function to get filter label
const getFilterLabel = (filterType, value) => {
  // This would need to be enhanced to show proper labels
  // For now, just return the value
  return value
}

export default KanbanPage