import { useState } from 'react'
import filterService from '../../services/filterService'

const FilterPresets = ({ 
  onPresetApply, 
  className = "",
  showAsButtons = false 
}) => {
  const [selectedPreset, setSelectedPreset] = useState(null)
  const presets = filterService.getFilterPresets()

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.id)
    onPresetApply(preset)
    
    // Reset selection after a short delay for visual feedback
    setTimeout(() => setSelectedPreset(null), 200)
  }

  const getPresetIcon = (presetId) => {
    const icons = {
      urgent_open: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      high_priority_in_progress: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      pending_vobo: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      closed_last_week: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      unassigned: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
    return icons[presetId] || (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
      </svg>
    )
  }

  const getPresetColor = (presetId) => {
    const colors = {
      urgent_open: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
      high_priority_in_progress: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
      pending_vobo: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      closed_last_week: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
      unassigned: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
    return colors[presetId] || 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
  }

  if (showAsButtons) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-200 ${
              selectedPreset === preset.id 
                ? 'ring-2 ring-fuchsia-500 ring-opacity-50' 
                : ''
            } ${getPresetColor(preset.id)}`}
            title={preset.description}
          >
            {getPresetIcon(preset.id)}
            <span className="ml-2">{preset.name}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Filtros rápidos</h4>
      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`w-full flex items-start p-3 text-left border rounded-lg transition-colors duration-200 ${
              selectedPreset === preset.id 
                ? 'ring-2 ring-fuchsia-500 ring-opacity-50' 
                : ''
            } ${getPresetColor(preset.id)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getPresetIcon(preset.id)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium">{preset.name}</p>
              <p className="text-xs opacity-75 mt-1">{preset.description}</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-2">
            <p className="text-xs font-medium text-blue-800">Filtros rápidos</p>
            <p className="text-xs text-blue-700 mt-1">
              Estos filtros predefinidos te ayudan a encontrar rápidamente los tickets más relevantes para tu trabajo diario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterPresets