import React, { useState, useEffect } from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
import { TICKET_STATES, TICKET_PRIORITIES, STATE_CONFIG, PRIORITY_CONFIG } from '../../utils/constants'

const FilterPanel = ({ 
  filters = {}, 
  onFiltersChange,
  showClientFilter = false,
  showTechnicianFilter = false,
  showTypeFilter = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = localFilters[filterType] || []
    let newValues

    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(v => v !== value)
    }

    const newFilters = {
      ...localFilters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    }

    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === undefined) {
        delete newFilters[key]
      }
    })

    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, values) => {
      return count + (Array.isArray(values) ? values.length : 0)
    }, 0)
  }

  const activeCount = getActiveFilterCount()

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button px-4 py-3 rounded-xl text-white font-medium bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {activeCount > 0 && (
          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 glass-morphism rounded-xl border border-white/20 shadow-xl z-20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filtros</h3>
              <div className="flex items-center space-x-2">
                {activeCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Estado Filter */}
              <FilterSection
                title="Estado"
                options={Object.entries(STATE_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label
                }))}
                selectedValues={localFilters.estados || []}
                onChange={(value, checked) => handleFilterChange('estados', value, checked)}
              />

              {/* Prioridad Filter */}
              <FilterSection
                title="Prioridad"
                options={Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label
                }))}
                selectedValues={localFilters.prioridades || []}
                onChange={(value, checked) => handleFilterChange('prioridades', value, checked)}
              />

              {/* Tipo Filter */}
              {showTypeFilter && (
                <FilterSection
                  title="Tipo"
                  options={[
                    { value: 'soporte_tecnico', label: 'Soporte Técnico' },
                    { value: 'consulta', label: 'Consulta' },
                    { value: 'incidencia', label: 'Incidencia' },
                    { value: 'mejora', label: 'Mejora' }
                  ]}
                  selectedValues={localFilters.tipos || []}
                  onChange={(value, checked) => handleFilterChange('tipos', value, checked)}
                />
              )}

              {/* Cliente Filter (only for admins) */}
              {showClientFilter && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-white/70 mb-2">Cliente</p>
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    className="glass-input w-full px-3 py-2 rounded-lg text-white placeholder-white/50 text-sm"
                  />
                </div>
              )}

              {/* Técnico Filter (only for admins) */}
              {showTechnicianFilter && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-white/70 mb-2">Técnico</p>
                  <input
                    type="text"
                    placeholder="Buscar técnico..."
                    className="glass-input w-full px-3 py-2 rounded-lg text-white placeholder-white/50 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const FilterSection = ({ title, options, selectedValues, onChange }) => {
  return (
    <div>
      <p className="text-sm font-medium text-white/90 mb-3">{title}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => onChange(option.value, e.target.checked)}
              className="w-4 h-4 text-purple-500 bg-white/10 border-white/30 rounded focus:ring-purple-400 focus:ring-2"
            />
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default FilterPanel