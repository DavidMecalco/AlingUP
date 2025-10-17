import { useState } from 'react'

const SearchHistory = ({ 
  history = [], 
  onHistoryItemClick, 
  onRefresh,
  maxItems = 10 
}) => {
  const [isClearing, setIsClearing] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Hace unos minutos'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
      } else {
        return date.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }

  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      // Note: This would need to be implemented in the search service
      // For now, we'll just refresh to show the current state
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error clearing history:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const displayHistory = history.slice(0, maxItems)

  if (history.length === 0) {
    return (
      <div className="p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-sm">No hay búsquedas recientes</p>
        <p className="text-gray-400 text-xs mt-1">Tus búsquedas aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-900">Búsquedas recientes</h4>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {isClearing ? 'Limpiando...' : 'Limpiar'}
          </button>
        )}
      </div>

      {/* History Items */}
      <div className="divide-y divide-gray-100">
        {displayHistory.map((item, index) => (
          <button
            key={item.id || index}
            onClick={() => onHistoryItemClick(item)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 group"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-fuchsia-600">
                  {item.query}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(item.searched_at)}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-gray-400 group-hover:text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Show More Link */}
      {history.length > maxItems && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={onRefresh}
            className="text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium"
          >
            Ver todas las búsquedas ({history.length})
          </button>
        </div>
      )}

      {/* Quick Search Tips */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2 font-medium">Consejos de búsqueda:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Busca por ID de ticket: "TKT-2024-001"</li>
          <li>• Busca por palabras clave en título o descripción</li>
          <li>• Usa comillas para frases exactas: "error de conexión"</li>
        </ul>
      </div>
    </div>
  )
}

export default SearchHistory