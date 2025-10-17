import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  PRIORITY_CONFIG, 
  STATE_CONFIG 
} from '../../utils/constants'
import ticketService from '../../services/ticketService'
import { userService } from '../../services/userService'
import DateRangePicker from './DateRangePicker'

const AdvancedFilterPanel = ({ 
  filters = {}, 
  onFiltersChange, 
  showClientFilter = true,
  showTechnicianFilter = true,
  showTypeFilter = true,
  showDateFilter = true,
  showSavedFilters = true,
  className = ""
}) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [ticketTypes, setTicketTypes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedFilters, setSavedFilters] = useState([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load filter options and saved filters
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true)
      try {
        // Load ticket types
        const typesResult = await ticketService.getTicketTypes()
        if (!typesResult.error) {
          setTicketTypes(typesResult.data)
        }

        // Load users for client/technician filters
        if (showClientFilter || showTechnicianFilter) {
          const usersResult = await userService.getUsers()
          if (!usersResult.error) {
            setUsers(usersResult.data)
          }
        }

        // Load saved filters
        if (showSavedFilters && user?.id) {
          loadSavedFilters()
        }
      } catch (error) {
        console.error('Error loading filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [showClientFilter, showTechnicianFilter, showSavedFilters, user?.id])

  const loadSavedFilters = async () => {
    try {
      // This would be implemented in a filter service
      // For now, we'll use localStorage as a fallback
      const saved = localStorage.getItem(`saved_filters_${user.id}`)
      if (saved) {
        setSavedFilters(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved filters:', error)
    }
  }

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || []
    let newValues

    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(v => v !== value)
    }

    const updatedFilters = {
      ...filters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    }

    // Clean up undefined values
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === undefined) {
        delete updatedFilters[key]
      }
    })

    onFiltersChange(updatedFilters)
  }

  const handleDateChange = (startDate, endDate) => {
    const updatedFilters = { ...filters }
    
    if (startDate) {
      updatedFilters.fecha_desde = startDate
    } else {
      delete updatedFilters.fecha_desde
    }
    
    if (endDate) {
      updatedFilters.fecha_hasta = endDate
    } else {
      delete updatedFilters.fecha_hasta
    }

    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const saveCurrentFilters = async () => {
    if (!filterName.trim() || !user?.id) return

    setIsSaving(true)
    try {
      const filterToSave = {
        id: Date.now().toString(),
        name: filterName.trim(),
        filters: filters,
        created_at: new Date().toISOString(),
        user_id: user.id
      }

      const currentSaved = [...savedFilters, filterToSave]
      setSavedFilters(currentSaved)
      
      // Save to localStorage (in a real app, this would be saved to the backend)
      localStorage.setItem(`saved_filters_${user.id}`, JSON.stringify(currentSaved))
      
      setFilterName('')
      setShowSaveDialog(false)
    } catch (error) {
      console.error('Error saving filters:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const applySavedFilter = (savedFilter) => {
    onFiltersChange(savedFilter.filters)
    setIsOpen(false)
  }

  const deleteSavedFilter = (filterId) => {
    const updatedSaved = savedFilters.filter(f => f.id !== filterId)
    setSavedFilters(updatedSaved)
    localStorage.setItem(`saved_filters_${user.id}`, JSON.stringify(updatedSaved))
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== undefined && value !== null
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null
    }).length
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
          hasActiveFilters
            ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        Filtros avanzados
        {hasActiveFilters && (
          <span className="ml-2 bg-fuchsia-600 text-white text-xs rounded-full px-2 py-0.5">
            {getActiveFilterCount()}
          </span>
        )}
        <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros avanzados</h3>
              <div className="flex space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
                {showSavedFilters && hasActiveFilters && (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="text-sm text-fuchsia-600 hover:text-fuchsia-700 font-medium"
                  >
                    Guardar
                  </button>
                )}
              </div>
            </div>

            {/* Save Filter Dialog */}
            {showSaveDialog && (
              <div className="mb-4 p-3 bg-fuchsia-50 border border-fuchsia-200 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del filtro
                    </label>
                    <input
                      type="text"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="Ej: Tickets urgentes pendientes"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                      maxLength={50}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={saveCurrentFilters}
                      disabled={!filterName.trim() || isSaving}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false)
                        setFilterName('')
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Filters */}
            {showSavedFilters && savedFilters.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Filtros guardados</h4>
                <div className="space-y-2">
                  {savedFilters.map((savedFilter) => (
                    <div key={savedFilter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <button
                        onClick={() => applySavedFilter(savedFilter)}
                        className="flex-1 text-left text-sm text-gray-700 hover:text-fuchsia-600 font-medium"
                      >
                        {savedFilter.name}
                      </button>
                      <button
                        onClick={() => deleteSavedFilter(savedFilter.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar filtro guardado"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Date Range Filter */}
              {showDateFilter && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Fecha de creación</h4>
                  <DateRangePicker
                    startDate={filters.fecha_desde}
                    endDate={filters.fecha_hasta}
                    onDateChange={handleDateChange}
                    placeholder="Seleccionar rango de fechas"
                  />
                </div>
              )}

              {/* Priority Filter */}
              <FilterSection
                title="Prioridad"
                options={Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                  color: config.badgeColor
                }))}
                selectedValues={filters.prioridades || []}
                onChange={(value, checked) => handleFilterChange('prioridades', value, checked)}
              />

              {/* State Filter */}
              <FilterSection
                title="Estado"
                options={Object.entries(STATE_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                  color: config.badgeColor
                }))}
                selectedValues={filters.estados || []}
                onChange={(value, checked) => handleFilterChange('estados', value, checked)}
              />

              {/* Ticket Type Filter */}
              {showTypeFilter && ticketTypes.length > 0 && (
                <FilterSection
                  title="Tipo de Ticket"
                  options={ticketTypes.map(type => ({
                    value: type.id,
                    label: type.nombre,
                    color: 'gray'
                  }))}
                  selectedValues={filters.tipos || []}
                  onChange={(value, checked) => handleFilterChange('tipos', value, checked)}
                />
              )}

              {/* Client Filter */}
              {showClientFilter && users.length > 0 && (
                <FilterSection
                  title="Cliente"
                  options={users
                    .filter(user => user.rol === 'cliente')
                    .map(user => ({
                      value: user.id,
                      label: user.nombre_completo,
                      subtitle: user.empresa_cliente,
                      color: 'gray'
                    }))}
                  selectedValues={filters.clientes || []}
                  onChange={(value, checked) => handleFilterChange('clientes', value, checked)}
                />
              )}

              {/* Technician Filter */}
              {showTechnicianFilter && users.length > 0 && (
                <FilterSection
                  title="Técnico"
                  options={users
                    .filter(user => user.rol === 'tecnico')
                    .map(user => ({
                      value: user.id,
                      label: user.nombre_completo,
                      color: 'gray'
                    }))}
                  selectedValues={filters.tecnicos || []}
                  onChange={(value, checked) => handleFilterChange('tecnicos', value, checked)}
                />
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-600"></div>
                <span className="ml-2 text-sm text-gray-600">Cargando opciones...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Enhanced Filter Section Component
const FilterSection = ({ title, options, selectedValues, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {/* Search within options if there are many */}
          {options.length > 5 && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar en ${title.toLowerCase()}...`}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
          )}

          <div className="max-h-32 overflow-y-auto space-y-2">
            {filteredOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => onChange(option.value, e.target.checked)}
                  className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {option.subtitle && (
                    <div className="text-xs text-gray-500">{option.subtitle}</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {filteredOptions.length === 0 && searchTerm && (
            <p className="text-sm text-gray-500 text-center py-2">
              No se encontraron opciones para "{searchTerm}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedFilterPanel