import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import timelineService from '../../services/timelineService'

/**
 * Timeline component for displaying chronological ticket events
 */
const Timeline = ({ ticketId, className = '' }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ticketId) {
      loadTimelineEvents()
    }
  }, [ticketId])

  const loadTimelineEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: timelineError } = await timelineService.getTimelineEvents(ticketId)
      
      if (timelineError) {
        setError(timelineError.message || 'Error al cargar el timeline')
        return
      }
      
      setEvents(data)
    } catch (err) {
      console.error('Error loading timeline:', err)
      setError('Error al cargar el timeline')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get icon and color for event type
   */
  const getEventIcon = (eventoTipo) => {
    const iconMap = {
      'ticket_creado': {
        icon: '🎫',
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
      },
      'ticket_asignado': {
        icon: '👤',
        color: 'bg-purple-500',
        textColor: 'text-purple-600'
      },
      'estado_cambiado': {
        icon: '🔄',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      'comentario_agregado': {
        icon: '💬',
        color: 'bg-green-500',
        textColor: 'text-green-600'
      },
      'archivo_subido': {
        icon: '📎',
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600'
      },
      'ticket_cerrado': {
        icon: '✅',
        color: 'bg-red-500',
        textColor: 'text-red-600'
      },
      'ticket_reabierto': {
        icon: '🔓',
        color: 'bg-orange-500',
        textColor: 'text-orange-600'
      }
    }

    return iconMap[eventoTipo] || {
      icon: '📋',
      color: 'bg-gray-500',
      textColor: 'text-gray-600'
    }
  }

  /**
   * Format user information for display
   */
  const formatUserInfo = (user) => {
    if (!user) return 'Sistema'
    
    const roleLabels = {
      'cliente': 'Cliente',
      'tecnico': 'Técnico',
      'admin': 'Administrador'
    }
    
    return `${user.nombre_completo} (${roleLabels[user.rol] || user.rol})`
  }

  /**
   * Get additional event details
   */
  const getEventDetails = (event) => {
    const { evento_tipo, datos_adicionales } = event
    
    if (!datos_adicionales) return null

    switch (evento_tipo) {
      case 'ticket_creado':
        return datos_adicionales.ticket_number ? 
          `Número de ticket: ${datos_adicionales.ticket_number}` : null
      
      case 'ticket_asignado':
        return datos_adicionales.tecnico_name ? 
          `Asignado a: ${datos_adicionales.tecnico_name}` : null
      
      case 'estado_cambiado':
        if (datos_adicionales.old_state && datos_adicionales.new_state) {
          const stateLabels = {
            'abierto': 'Abierto',
            'en_progreso': 'En Progreso',
            'vobo': 'VoBo',
            'cerrado': 'Cerrado'
          }
          return `${stateLabels[datos_adicionales.old_state]} → ${stateLabels[datos_adicionales.new_state]}`
        }
        return null
      
      case 'archivo_subido':
        if (datos_adicionales.file_name && datos_adicionales.file_type) {
          const typeLabels = {
            'foto': 'Imagen',
            'video': 'Video',
            'documento': 'Documento',
            'nota_voz': 'Nota de voz'
          }
          return `${typeLabels[datos_adicionales.file_type] || 'Archivo'}: ${datos_adicionales.file_name}`
        }
        return null
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadTimelineEvents}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-4xl mb-2">📋</div>
        <p>No hay eventos en el timeline</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map((event, index) => {
        const { icon, color, textColor } = getEventIcon(event.evento_tipo)
        const userInfo = formatUserInfo(event.user)
        const eventDetails = getEventDetails(event)
        const isLast = index === events.length - 1

        return (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-600"></div>
            )}
            
            {/* Event item */}
            <div className="flex items-start space-x-3">
              {/* Event icon */}
              <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm`}>
                <span className="text-xs">{icon}</span>
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  {/* Event description */}
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {event.descripcion}
                  </p>
                  
                  {/* Event details */}
                  {eventDetails && (
                    <p className={`text-xs ${textColor} dark:opacity-80 mb-2`}>
                      {eventDetails}
                    </p>
                  )}
                  
                  {/* User and timestamp */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">
                      {userInfo}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(event.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline