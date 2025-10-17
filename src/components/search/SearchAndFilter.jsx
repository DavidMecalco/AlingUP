import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import GlobalSearch from './GlobalSearch'
import AdvancedFilterPanel from '../filters/AdvancedFilterPanel'
import FilterPresets from '../filters/FilterPresets'
import useSearch from '../../hooks/useSearch'
import useFilters from '../../hooks/useFilters'

const SearchAndFilter = ({ 
  onResultsChange,
  onFiltersChange,
  initialFilters = {},
  showPresets = true,
  showAdvancedFilters = true,
  context = 'default',
  className = ""
}) => {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('search') // 'search', 'filters', 'presets'
  const [combinedResults, setCombinedResults] = useState([])

  // Initialize search hook
  const {
    query,
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    setQuery,
    clearSearch
  } = useSearch({
    autoSaveHistory: true,
    includeHighlights: true
  })

  // Initialize filters hook
  const {
    filters,
    savedFilters,
    isLoading: isFiltersLoading,
    error: filtersError,
    updateFilters,
    clearFilters,
    applySavedFilter,
    applyPreset,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilters({
    context,
    persistToLocalStorage: true,
    autoSave: true
  })

  // Initialize filters from props
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      updateFilters(initialFilters)
    }
  }, [initialFilters, updateFilters])

  // Combine search results with filter results
  useEffect(() => {
    const combineResults = async () => {
      let results = []

      // If we have a search query, use search results
      if (query && query.trim().length >= 2) {
        results = searchResults
      } else if (hasActiveFilters) {
        // If no search but we have filters, get filtered results
        // This would typically call the ticket service with filters
        // For now, we'll use the search results as a base
        results = searchResults
      }

      setCombinedResults(results)
      
      // Notify parent component
      if (onResultsChange) {
        onResultsChange(results, { query, filters })
      }
    }

    combineResults()
  }, [searchResults, query, filters, hasActiveFilters, onResultsChange])

  // Notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }, [filters, onFiltersChange])

  const handlePresetApply = (preset) => {
    applyPreset(preset.id)
    setActiveView('filters')
  }

  const handleSavedFilterApply = (savedFilter) => {
    applySavedFilter(savedFilter)
    setActiveView('filters')
  }

  const handleClearAll = () => {
    clearSearch()
    clearFilters()
    setActiveView('search')
  }

  const isLoading = isSearchLoading || isFiltersLoading
  const hasError = searchError || filtersError
  const hasQuery = query && query.trim().length >= 2
  const hasResults = combinedResults.length > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Global Search */}
        <div className="flex-1">
          <GlobalSearch
            onResultSelect={(ticket) => {
              // Handle individual result selection if needed
              console.log('Selected ticket:', ticket)
            }}
            placeholder="Buscar tickets por título, descripción o ID..."
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          {showAdvancedFilters && (
            <AdvancedFilterPanel
              filters={filters}
              onFiltersChange={updateFilters}
              showSavedFilters={true}
            />
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('search')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeView === 'search'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Búsqueda
            {hasQuery && (
              <span className="ml-2 bg-fuchsia-100 text-fuchsia-800 text-xs rounded-full px-2 py-0.5">
                "{query}"
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveView('filters')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeView === 'filters'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-fuchsia-100 text-fuchsia-800 text-xs rounded-full px-2 py-0.5">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          
          {showPresets && (
            <button
              onClick={() => setActiveView('presets')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeView === 'presets'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rápidos
            </button>
          )}
        </div>

        {/* Clear All Button */}
        {(hasQuery || hasActiveFilters) && (
          <button
            onClick={handleClearAll}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600 font-medium">Error</p>
            <p className="text-gray-600 text-sm mt-1">{searchError || filtersError}</p>
          </div>
        )}

        {/* Content based on active view */}
        {!isLoading && !hasError && (
          <>
            {activeView === 'search' && (
              <div className="p-6">
                {hasQuery ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Resultados de búsqueda
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({combinedResults.length} {combinedResults.length === 1 ? 'resultado' : 'resultados'})
                      </span>
                    </h3>
                    
                    {hasResults ? (
                      <div className="space-y-4">
                        {combinedResults.map((ticket) => (
                          <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{ticket.titulo}</h4>
                                <p className="text-sm text-gray-600 mt-1">{ticket.ticket_number}</p>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {ticket.estado}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-500">Ingresa un término de búsqueda</p>
                  </div>
                )}
              </div>
            )}

            {activeView === 'filters' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros activos</h3>
                
                {hasActiveFilters ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {getActiveFilterCount()} {getActiveFilterCount() === 1 ? 'filtro activo' : 'filtros activos'}
                      </p>
                    </div>
                    
                    {/* Display active filters */}
                    <div className="space-y-2">
                      {Object.entries(filters).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="text-sm text-gray-600">
                            {Array.isArray(value) ? value.join(', ') : value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                    <p className="text-gray-500">No hay filtros activos</p>
                    <p className="text-gray-400 text-sm mt-1">Usa el panel de filtros para refinar los resultados</p>
                  </div>
                )}
              </div>
            )}

            {activeView === 'presets' && showPresets && (
              <div className="p-6">
                <FilterPresets
                  onPresetApply={handlePresetApply}
                  showAsButtons={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Results Summary */}
      {!isLoading && (hasQuery || hasActiveFilters) && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span>
            {hasResults ? (
              <>Mostrando {combinedResults.length} {combinedResults.length === 1 ? 'resultado' : 'resultados'}</>
            ) : (
              'No se encontraron resultados'
            )}
          </span>
          
          {(hasQuery || hasActiveFilters) && (
            <span>
              {hasQuery && `Búsqueda: "${query}"`}
              {hasQuery && hasActiveFilters && ' • '}
              {hasActiveFilters && `${getActiveFilterCount()} ${getActiveFilterCount() === 1 ? 'filtro' : 'filtros'}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchAndFilter