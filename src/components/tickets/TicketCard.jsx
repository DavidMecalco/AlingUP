import React from 'react'
import { formatTicketId, getTicketAge, getPriorityConfig, getStateConfig, getTextPreview } from '../../utils/helpers'
import TicketIdDisplay from './TicketIdDisplay'
import { Clock, User, Wrench } from 'lucide-react'
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`glass-card transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 group ${
        isKanban 
          ? 'hover:scale-[1.02] hover:shadow-xl hover:bg-white/15' 
          : 'hover:scale-[1.02] hover:shadow-glass-hover'
      }`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles del ticket ${ticket.ticket_number || formatTicketId(ticket.id)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {ticket.ticket_number ? (
              <TicketIdDisplay 
                ticketNumber={ticket.ticket_number} 
                size="small"
                showCopyButton={false}
              />
            ) : (
              <span className="text-sm font-mono text-white/60 bg-white/10 px-2 py-1 rounded-lg">
                {formatTicketId(ticket.id)}
              </span>
            )}
            {!isKanban && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium glass-morphism ${
                ticket.estado === 'abierto' ? 'text-blue-300 bg-blue-500/20' :
                ticket.estado === 'en_progreso' ? 'text-yellow-300 bg-yellow-500/20' :
                ticket.estado === 'cerrado' ? 'text-green-300 bg-green-500/20' :
                'text-gray-300 bg-gray-500/20'
              }`}>
                {stateConfig.label}
              </span>
            )}
          </div>
          <h3 className={`font-semibold text-white truncate group-hover:text-purple-200 transition-colors ${
            isKanban ? 'text-base' : 'text-lg'
          }`} title={ticket.titulo}>
            {ticket.titulo}
          </h3>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium glass-morphism ${
            ticket.prioridad === 'urgente' ? 'text-red-300 bg-red-500/20' :
            ticket.prioridad === 'alta' ? 'text-orange-300 bg-orange-500/20' :
            ticket.prioridad === 'media' ? 'text-blue-300 bg-blue-500/20' :
            'text-gray-300 bg-gray-500/20'
          }`}>
            {isKanban ? priorityConfig.label.charAt(0) : priorityConfig.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className={`text-white/70 text-sm mb-4 line-clamp-2 ${
        isKanban ? 'line-clamp-3' : 'line-clamp-2'
      }`} title={getTextPreview(ticket.descripcion, 200)}>
        {getTextPreview(ticket.descripcion, isKanban ? 100 : 120)}
      </p>

      {/* Metadata */}
      <div className={`text-sm ${isKanban ? 'space-y-2' : 'space-y-3'}`}>
        {/* Client Info */}
        {showClient && ticket.cliente && (
          <div className={`flex items-center glass-morphism rounded-xl ${isKanban ? 'p-1.5' : 'p-2'}`}>
            <User className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
            <span className="truncate text-white/80 text-xs">
              {ticket.cliente.nombre_completo}
              {!isKanban && ticket.cliente.empresa_cliente && (
                <span className="text-white/50"> • {ticket.cliente.empresa_cliente}</span>
              )}
            </span>
          </div>
        )}

        {/* Technician Info */}
        {showTechnician && (
          <div className={`flex items-center glass-morphism rounded-xl ${isKanban ? 'p-1.5' : 'p-2'}`}>
            <Wrench className="w-4 h-4 mr-2 flex-shrink-0 text-purple-400" />
            <span className="truncate text-white/80 text-xs">
              {ticket.tecnico ? ticket.tecnico.nombre_completo : 'Sin asignar'}
            </span>
          </div>
        )}

        {/* Ticket Type */}
        {ticket.tipo_ticket && !isKanban && (
          <div className="flex items-center glass-morphism rounded-xl p-2">
            <div className="w-4 h-4 mr-2 flex-shrink-0 bg-indigo-400 rounded-sm"></div>
            <span className="truncate text-white/80">{ticket.tipo_ticket.nombre}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-4 border-t border-white/10 ${
        isKanban ? 'mt-4' : 'mt-6'
      }`}>
        <div className="flex items-center text-xs text-white/60">
          <Clock className="w-3 h-3 mr-1" />
          <span>{getTicketAge(ticket.created_at)}</span>
        </div>

        {/* Action Indicator */}
        {!isKanban && (
          <div className="flex items-center text-purple-300 group-hover:text-purple-200 transition-colors">
            <span className="text-xs font-medium mr-1">Ver detalles</span>
            <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Kanban drag indicator */}
        {isKanban && (
          <div className="flex items-center text-white/40 group-hover:text-white/60 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketCard