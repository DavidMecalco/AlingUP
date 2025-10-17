import { useState } from 'react'
import searchService from '../../services/searchService'
import { useAuth } from '../../contexts/AuthContext'

const SavedSearches = ({ 
  savedSearches = [], 
  onSavedSearchClick, 
  onSaveCurrentSearch,
  currentQuery = '',
  onRefresh 
}) => {
  const { user } = useAuth()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSaveSearch = async () => {
    if (!saveName.trim() || !currentQuery.trim()) return

    setIsSaving(true)
    try {
      await onSaveCurrentSearch(saveName.trim())
      setSaveName('')
      setShowSaveDialog(false)
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error saving search:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSearch = async (searchId) => {
    if (!user?.id) return

    setDeletingId(searchId)
    try {
      const { error } = await searchService.deleteSavedSearch(searchId, user.id)
      if (!error && onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error deleting saved search:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getFilterSummary = (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return 'Sin filtros'
    }

    const parts = []
    if (filters.estados?.length) {
      parts.push(`${filters.estados.length} estado${filters.estados.length > 1 ? 's' : ''}`)
    }
    if (filters.prioridades?.length) {
      parts.push(`${filters.prioridades.length} prioridad${filters.prioridades.length > 1 ? 'es' : ''}`)
    }
    if (filters.tipos?.length) {
      parts.push(`${filters.tipos.length} tipo${filters.tipos.length > 1 ? 's' : ''}`)
    }
    if (filters.tecnicos?.length) {
      parts.push(`${filters.tecnicos.length} técnico${filters.tecnicos.length > 1 ? 's' : ''}`)
    }
    if (filters.clientes?.length) {
      parts.push(`${filters.clientes.length} cliente${filters.clientes.length > 1 ? 's' : ''}`)
    }

    return parts.length > 0 ? parts.join(', ') : 'Sin filtros'
  }

  return (
    <div className="py-2">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-900">Búsquedas guardadas</h4>
        {currentQuery.trim() && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium"
          >
            Guardar actual
          </button>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="px-4 py-3 border-b border-gray-100 bg-fuchsia-50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre de la búsqueda
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Ej: Tickets urgentes pendientes"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                maxLength={50}
              />
            </div>
            
            <div className="text-xs text-gray-600">
              <strong>Búsqueda:</strong> "{currentQuery}"
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveSearch}
                disabled={!saveName.trim() || isSaving}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveName('')
                }}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      {savedSearches.length === 0 ? (
        <div className="p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-gray-500 text-sm">No tienes búsquedas guardadas</p>
          <p className="text-gray-400 text-xs mt-1">Guarda tus búsquedas frecuentes para acceso rápido</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => onSavedSearchClick(search)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="h-4 w-4 text-fuchsia-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <h5 className="text-sm font-medium text-gray-900 truncate group-hover:text-fuchsia-600">
                      {search.name}
                    </h5>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    <strong>Búsqueda:</strong> "{search.query}"
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Filtros:</strong> {getFilterSummary(search.filters)}
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    Guardada el {formatDate(search.created_at)}
                  </p>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  disabled={deletingId === search.id}
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150 disabled:opacity-50"
                  title="Eliminar búsqueda guardada"
                >
                  {deletingId === search.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2 font-medium">Búsquedas guardadas:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Guarda combinaciones de búsqueda y filtros frecuentes</li>
          <li>• Accede rápidamente a tus consultas más utilizadas</li>
          <li>• Comparte búsquedas guardadas con tu equipo</li>
        </ul>
      </div>
    </div>
  )
}

export default SavedSearches