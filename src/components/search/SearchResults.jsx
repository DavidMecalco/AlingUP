import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATE_CONFIG, PRIORITY_CONFIG } from '../../utils/constants'

const SearchResults = ({ 
  results = [], 
  isLoading = false, 
  query = '', 
  onResultClick,
  showPreview = true 
}) => {
  const navigate = useNavigate()
  const [selectedResult, setSelectedResult] = useState(null)

  const handleResultClick = (ticket) => {
    if (onResultClick) {
      onResultClick(ticket)
    } else {
      navigate(`/tickets/${ticket.id}`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const renderHighlightedText = (text, highlightedText) => {
    if (highlightedText) {
      return (
        <span 
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          className="text-sm text-gray-600"
        />
      )
    }
    return <span className="text-sm text-gray-600">{truncateText(text)}</span>
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
          <span className="ml-3 text-gray-600">Buscando...</span>
        </div>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Ingresa un término de búsqueda para encontrar tickets</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.41-1.267-5.5-3.15M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-lg font-medium mb-2">No se encontraron resultados</p>
          <p>No hay tickets que coincidan con "{query}"</p>
          <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Resultados de búsqueda
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({results.length} {results.length === 1 ? 'resultado' : 'resultados'} para "{query}")
          </span>
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {results.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            onClick={() => handleResultClick(ticket)}
            onMouseEnter={() => setSelectedResult(ticket.id)}
            onMouseLeave={() => setSelectedResult(null)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Ticket Header */}
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium text-fuchsia-600">
                    {ticket.ticket_number}
                  </span>
                  
                  {/* State Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATE_CONFIG[ticket.estado]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {STATE_CONFIG[ticket.estado]?.label || ticket.estado}
                  </span>
                  
                  {/* Priority Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[ticket.prioridad]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {PRIORITY_CONFIG[ticket.prioridad]?.label || ticket.prioridad}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-medium text-gray-900 mb-1">
                  {renderHighlightedText(ticket.titulo, ticket.titulo_highlighted)}
                </h4>

                {/* Description Preview */}
                {showPreview && (
                  <div className="mb-2">
                    {renderHighlightedText(
                      ticket.descripcion?.replace(/<[^>]*>/g, ''), // Strip HTML tags for preview
                      ticket.descripcion_highlighted?.replace(/<(?!mark|\/mark)[^>]*>/g, '') // Keep only mark tags
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    Cliente: {ticket.cliente?.nombre_completo || 'No asignado'}
                  </span>
                  
                  {ticket.tecnico && (
                    <span>
                      Técnico: {ticket.tecnico.nombre_completo}
                    </span>
                  )}
                  
                  <span>
                    {formatDate(ticket.created_at)}
                  </span>
                  
                  {ticket.tipo_ticket && (
                    <span className="inline-flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: ticket.tipo_ticket.color || '#6B7280' }}
                      ></div>
                      {ticket.tipo_ticket.nombre}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Icon */}
              <div className="flex-shrink-0 ml-4">
                <svg 
                  className={`h-5 w-5 transition-colors duration-150 ${
                    selectedResult === ticket.id ? 'text-fuchsia-600' : 'text-gray-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length >= 50 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Mostrando los primeros 50 resultados. Refina tu búsqueda para obtener resultados más específicos.
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchResults