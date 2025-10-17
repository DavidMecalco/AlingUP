import React from 'react'
import { formatTicketId, getTicketAge, getPriorityConfig, getStateConfig, getTextPreview } from '../../utils/helpers'
import TicketIdDisplay from './TicketIdDisplay'

const TicketCard = ({ ticket, onClick, showClient = false, showTechnician = false }) => {
  const priorityConfig = getPriorityConfig(ticket.prioridad)
  const stateConfig = getStateConfig(ticket.estado)

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
      className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles del ticket ${ticket.ticket_number || formatTicketId(ticket.id)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {ticket.ticket_number ? (
              <TicketIdDisplay 
                ticketNumber={ticket.ticket_number} 
                size="small"
                showCopyButton={false}
              />
            ) : (
              <span className="text-sm font-mono text-gray-500">
                {formatTicketId(ticket.id)}
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stateConfig.color}`}>
              {stateConfig.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 truncate" title={ticket.titulo}>
            {ticket.titulo}
          </h3>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2" title={getTextPreview(ticket.descripcion, 200)}>
        {getTextPreview(ticket.descripcion, 120)}
      </p>

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-500">
        {/* Client Info */}
        {showClient && ticket.cliente && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">
              {ticket.cliente.nombre_completo}
              {ticket.cliente.empresa_cliente && (
                <span className="text-gray-400"> • {ticket.cliente.empresa_cliente}</span>
              )}
            </span>
          </div>
        )}

        {/* Technician Info */}
        {showTechnician && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {ticket.tecnico ? ticket.tecnico.nombre_completo : 'Sin asignar'}
            </span>
          </div>
        )}

        {/* Ticket Type */}
        {ticket.tipo_ticket && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="truncate">{ticket.tipo_ticket.nombre}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{getTicketAge(ticket.created_at)}</span>
        </div>

        {/* Action Indicator */}
        <div className="flex items-center text-primary-600">
          <span className="text-xs font-medium mr-1">Ver detalles</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default TicketCard