import React, { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import KanbanBoard from '../components/tickets/KanbanBoard'
import SearchBar from '../components/filters/SearchBar'
import FilterPanel from '../components/filters/FilterPanel'
import { useAuth } from '../hooks/useAuth'

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

  // Check if user has access to Kanban board
  if (!user || (user.rol !== 'tecnico' && user.rol !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los técnicos y administradores pueden acceder al tablero Kanban.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.rol === 'tecnico' ? 'Mis Tickets' : 'Tablero Kanban'}
              </h1>
              <p className="mt-2 text-gray-600">
                {user.rol === 'tecnico' 
                  ? 'Gestiona tus tickets asignados'
                  : 'Vista general de todos los tickets'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
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
                showClientFilter={user.rol === 'admin'}
                showTechnicianFilter={user.rol === 'admin'}
                showTypeFilter={true}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {Object.entries(filters).map(([key, values]) => 
                values && Array.isArray(values) && values.map(value => (
                  <span
                    key={`${key}-${value}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
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
                      className="ml-2 text-primary-600 hover:text-primary-800"
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
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar todos
              </button>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{ height: 'calc(100vh - 300px)' }}>
          <KanbanBoard
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