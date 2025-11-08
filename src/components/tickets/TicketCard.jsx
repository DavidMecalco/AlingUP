import { memo } from 'react'
import { formatTicketId, getTicketAge, getPriorityConfig, getStateConfig, getTextPreview } from '../../utils/helpers'
import TicketIdDisplay from './TicketIdDisplay'
import { Clock, User, Wrench, ArrowRight, AlertCircle, CheckCircle, PlayCircle, XCircle } from 'lucide-react'
import '../../styles/glass.css'

const TicketCard = ({ 
  ticket, 
  onClick, 
  showClient = false, 
  showTechnician = false, 
  variant = "default" 
}) => {
  const priorityConfig = getPriorityConfig(ticket.prioridad)
  const stateConfig = getStateConfig(ticket.estado)
  
  const isKanban = variant === "kanban"

  const handleClick = () => {
    if (onClick) {
      onClick(ticket)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // Función para obtener el icono del estado
  const getStateIcon = (estado) => {
    switch (estado) {
      case 'abierto':
        return <AlertCircle className="w-4 h-4" />
      case 'en_progreso':
        return <PlayCircle className="w-4 h-4" />
      case 'vobo':
        return <CheckCircle className="w-4 h-4" />
      case 'cerrado':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Función para obtener colores mejorados
  const getPriorityColors = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-900 border-red-300'
      case 'alta':
        return 'bg-orange-100 text-orange-900 border-orange-300'
      case 'media':
        return 'bg-blue-100 text-blue-900 border-blue-300'
      case 'baja':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300'
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300'
    }
  }

  const getStateColors = (estado) => {
    switch (estado) {
      case 'abierto':
        return 'bg-blue-100 text-blue-900 border-blue-300'
      case 'en_progreso':
        return 'bg-amber-100 text-amber-900 border-amber-300'
      case 'vobo':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300'
      case 'cerrado':
        return 'bg-slate-100 text-slate-900 border-slate-300'
      default:
        return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  return (
    <div
      className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:border-blue-300/50"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles del ticket ${ticket.ticket_number || formatTicketId(ticket.id)}`}
    >
      {/* Header con ID y badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* ID del ticket */}
          <div className="mb-3">
            {ticket.ticket_number ? (
              <TicketIdDisplay 
                ticketNumber={ticket.ticket_number} 
                size="small"
                showCopyButton={false}
              />
            ) : (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-900 font-mono text-sm rounded-lg border border-blue-200">
                {formatTicketId(ticket.id)}
              </span>
            )}
          </div>
          
          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors line-clamp-2" title={ticket.titulo}>
            {ticket.titulo}
          </h3>
        </div>

        {/* Badges de estado y prioridad */}
        <div className="flex flex-col gap-2 ml-4">
          {/* Estado */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${getStateColors(ticket.estado)}`}>
            {getStateIcon(ticket.estado)}
            <span>{stateConfig.label}</span>
          </div>
          
          {/* Prioridad */}
          <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getPriorityColors(ticket.prioridad)}`}>
            <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
            {priorityConfig.label}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2" title={getTextPreview(ticket.descripcion, 200)}>
          {getTextPreview(ticket.descripcion, isKanban ? 100 : 150)}
        </p>
      </div>

      {/* Información adicional */}
      <div className="space-y-3 mb-4">
        {/* Cliente */}
        {showClient && ticket.cliente && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">
                {ticket.cliente.nombre_completo}
              </p>
              {ticket.cliente.empresa_cliente && (
                <p className="text-gray-600 text-xs truncate">
                  {ticket.cliente.empresa_cliente}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Técnico */}
        {showTechnician && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">
                {ticket.tecnico ? ticket.tecnico.nombre_completo : 'Sin asignar'}
              </p>
              <p className="text-gray-600 text-xs">
                {ticket.tecnico ? 'Técnico asignado' : 'Pendiente de asignación'}
              </p>
            </div>
          </div>
        )}

        {/* Tipo de ticket */}
        {ticket.tipo_ticket && !isKanban && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">
                {ticket.tipo_ticket.nombre}
              </p>
              <p className="text-gray-600 text-xs">Categoría</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* Tiempo */}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{getTicketAge(ticket.created_at)}</span>
        </div>

        {/* Acción */}
        <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
          <span className="text-sm font-medium">Ver detalles</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  )
}

export default memo(TicketCard)