import { useState, useEffect } from 'react'

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  label = "Rango de fechas",
  placeholder = "Seleccionar fechas",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')

  // Initialize temp dates when props change
  useEffect(() => {
    setTempStartDate(startDate ? formatDateForInput(startDate) : '')
    setTempEndDate(endDate ? formatDateForInput(endDate) : '')
  }, [startDate, endDate])

  const formatDateForInput = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const formatDateForDisplay = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleApply = () => {
    const newStartDate = tempStartDate ? new Date(tempStartDate) : null
    const newEndDate = tempEndDate ? new Date(tempEndDate) : null

    // Validate date range
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    onDateChange(newStartDate, newEndDate)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempStartDate('')
    setTempEndDate('')
    onDateChange(null, null)
    setIsOpen(false)
  }

  const getPresetRange = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    return { start, end }
  }

  const applyPreset = (days) => {
    const { start, end } = getPresetRange(days)
    setTempStartDate(formatDateForInput(start))
    setTempEndDate(formatDateForInput(end))
  }

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
    } else if (startDate) {
      return `Desde ${formatDateForDisplay(startDate)}`
    } else if (endDate) {
      return `Hasta ${formatDateForDisplay(endDate)}`
    }
    return placeholder
  }

  const hasDateRange = startDate || endDate

  return (
    <div className={`relative ${className}`}>
      {/* Date Range Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md transition-colors duration-200 ${
          hasDateRange
            ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={hasDateRange ? 'font-medium' : ''}>{getDisplayText()}</span>
        </div>
        
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Date Range Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
              {hasDateRange && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Rangos rápidos:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset(7)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Últimos 7 días
                </button>
                <button
                  onClick={() => applyPreset(30)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Últimos 30 días
                </button>
                <button
                  onClick={() => applyPreset(90)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Últimos 3 meses
                </button>
                <button
                  onClick={() => applyPreset(365)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Último año
                </button>
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 transition-colors"
              >
                Aplicar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
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

export default DateRangePicker