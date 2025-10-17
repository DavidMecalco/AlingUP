import React, { useState, useEffect } from 'react'
import { 
  TICKET_PRIORITIES, 
  PRIORITY_CONFIG, 
  TICKET_STATES, 
  STATE_CONFIG 
} from '../../utils/constants'
import ticketService from '../../services/ticketService'

const FilterPanel = ({ 
  filters = {}, 
  onFiltersChange, 
  showClientFilter = true,
  showTechnicianFilter = true,
  showTypeFilter = true 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [ticketTypes, setTicketTypes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true)
      try {
        // Load ticket types
        const typesResult = await ticketService.getTicketTypes()
        if (!typesResult.error) {
          setTicketTypes(typesResult.data)
        }

        // TODO: Load users for client/technician filters
        // This would require a user service
        setUsers([])
      } catch (error) {
        console.error('Error loading filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [])

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || []
    let newValues

    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(v => v !== value)
    }

    onFiltersChange({
      ...filters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] && (Array.isArray(filters[key]) ? filters[key].length > 0 : filters[key])
  )

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
          hasActiveFilters
            ? 'bg-primary-50 border-primary-200 text-primary-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
            {Object.keys(filters).filter(key => filters[key] && (Array.isArray(filters[key]) ? filters[key].length > 0 : filters[key])).length}
          </span>
        )}
        <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            <div className="space-y-6">
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
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Filter Section Component
const FilterSection = ({ title, options, selectedValues, onChange }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => onChange(option.value, e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default FilterPanel