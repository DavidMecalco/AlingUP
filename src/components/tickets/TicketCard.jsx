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
      className="glass-card glass-strong transition-all duration-300 cursor-pointer hover:glass-hover hover:scale-[1.02] hover:shadow-2xl group focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-white/30 hover:border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/50"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles del ticket ${ticket.ticket_number || formatTicketId(ticket.id)}`}
    >
      {/* Enhanced Header con ID y badges */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          {/* ID del ticket */}
          <div className="mb-4">
            {ticket.ticket_number ? (
              <TicketIdDisplay 
                ticketNumber={ticket.ticket_number} 
                size="small"
                showCopyButton={false}
              />
            ) : (
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-900 font-mono text-sm rounded-xl border border-blue-200/50 shadow-sm">
                {formatTicketId(ticket.id)}
              </span>
            )}
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors line-clamp-2 leading-tight" title={ticket.titulo}>
            {ticket.titulo}
          </h3>
        </div>

        {/* Enhanced Badges de estado y prioridad */}
        <div className="flex flex-col gap-3 ml-6">
          {/* Estado */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStateColors(ticket.estado)}`}>
            {getStateIcon(ticket.estado)}
            <span>{stateConfig.label}</span>
          </div>
          
          {/* Prioridad */}
          <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getPriorityColors(ticket.prioridad)}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current mr-2"></span>
            {priorityConfig.label}
          </div>
        </div>
      </div>

      {/* Enhanced Descripción */}
      <div className="mb-6">
        <p className="text-gray-800 text-base leading-relaxed line-clamp-3 font-medium" title={getTextPreview(ticket.descripcion, 200)}>
          {getTextPreview(ticket.descripcion, isKanban ? 120 : 180)}
        </p>
      </div>

      {/* Enhanced Información adicional */}
      <div className="space-y-4 mb-6">
        {/* Cliente */}
        {showClient && ticket.cliente && (
          <div className="flex items-center gap-4 p-4 glass-subtle rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm truncate">
                {ticket.cliente.nombre_completo}
              </p>
              {ticket.cliente.empresa_cliente && (
                <p className="text-gray-700 text-xs truncate mt-1">
                  {ticket.cliente.empresa_cliente}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Técnico */}
        {showTechnician && (
          <div className="flex items-center gap-4 p-4 glass-subtle rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm truncate">
                {ticket.tecnico ? ticket.tecnico.nombre_completo : 'Sin asignar'}
              </p>
              <p className="text-gray-700 text-xs mt-1">
                {ticket.tecnico ? 'Técnico asignado' : 'Pendiente de asignación'}
              </p>
            </div>
          </div>
        )}

        {/* Tipo de ticket */}
        {ticket.tipo_ticket && !isKanban && (
          <div className="flex items-center gap-4 p-4 glass-subtle rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm truncate">
                {ticket.tipo_ticket.nombre}
              </p>
              <p className="text-gray-700 text-xs mt-1">Categoría del ticket</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
        {/* Tiempo */}
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900">{getTicketAge(ticket.created_at)}</span>
            <p className="text-xs text-gray-600">Tiempo transcurrido</p>
          </div>
        </div>

        {/* Enhanced Acción */}
        <div className="flex items-center gap-3 text-blue-700 group-hover:text-blue-800 transition-all duration-300">
          <span className="text-sm font-semibold">Ver detalles</span>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TicketCard)