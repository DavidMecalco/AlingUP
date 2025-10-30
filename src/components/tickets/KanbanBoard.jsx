import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { TICKET_STATES, STATE_CONFIG, STATE_TRANSITIONS } from '../../utils/constants'
import TicketCard from './TicketCard'
import { useTickets } from '../../hooks/useTickets'
import { useAuth } from '../../hooks/useAuth'
import '../../styles/kanban.css'

const KanbanBoard = ({ filters = {}, searchTerm = '' }) => {
  const { user } = useAuth()
  const { 
    ticketsByState, 
    loading, 
    error, 
    refresh,
    updateTicketState 
  } = useTickets({ 
    filters, 
    searchTerm, 
    autoFetch: true 
  })

  const [dragError, setDragError] = useState(null)
  
  // Get user role consistently
  const userRole = user?.rol || user?.profile?.rol

  // Define the Kanban columns in order
  const columns = [
    { key: TICKET_STATES.ABIERTO, label: 'Abierto', config: STATE_CONFIG.abierto },
    { key: TICKET_STATES.EN_PROGRESO, label: 'En Progreso', config: STATE_CONFIG.en_progreso },
    { key: TICKET_STATES.VOBO, label: 'VoBo', config: STATE_CONFIG.vobo },
    { key: TICKET_STATES.CERRADO, label: 'Cerrado', config: STATE_CONFIG.cerrado }
  ]

  // Handle ticket click
  const handleTicketClick = (ticket) => {
    // TODO: Navigate to ticket detail page
    console.log('Ticket clicked:', ticket)
  }

  // Validate state transition
  const isValidTransition = (fromState, toState) => {
    // Admins can move tickets to any state
    if (userRole === 'admin') {
      return true
    }

    // Check if transition is allowed based on STATE_TRANSITIONS
    const allowedStates = STATE_TRANSITIONS[fromState] || []
    return allowedStates.includes(toState)
  }

  // Handle drag end
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // Clear any previous drag errors
    setDragError(null)

    // If dropped outside a droppable area
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceState = source.droppableId
    const destinationState = destination.droppableId
    const ticketId = draggableId

    // Validate state transition
    if (!isValidTransition(sourceState, destinationState)) {
      setDragError(`No se puede mover el ticket de "${STATE_CONFIG[sourceState]?.label}" a "${STATE_CONFIG[destinationState]?.label}"`)
      return
    }

    // Only allow technicians to move their assigned tickets
    if (userRole === 'tecnico') {
      const ticket = Object.values(ticketsByState)
        .flat()
        .find(t => t.id === ticketId)
      
      if (ticket && ticket.tecnico_id !== user.id) {
        setDragError('Solo puedes mover tickets asignados a ti')
        return
      }
    }

    // Update ticket state
    const result_update = await updateTicketState(ticketId, destinationState)
    
    if (!result_update.success) {
      setDragError(result_update.error || 'Error al actualizar el ticket')
    }
  }

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="text-center">
          <div className="kanban-loading-spinner mx-auto mb-4"></div>
          <p className="text-white/70">Cargando tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="kanban-error">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-300 font-medium">Error al cargar tickets</span>
        </div>
        <p className="text-red-200 text-sm mb-4">{error}</p>
        <button
          onClick={refresh}
          className="glass-button px-4 py-2 rounded-lg text-white bg-red-500/20 hover:bg-red-500/30 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {userRole === 'tecnico' ? 'Mis Tickets Asignados' : 'Tablero Kanban'}
            </h2>
            <p className="text-white/70">
              {userRole === 'tecnico' 
                ? 'Arrastra los tickets entre columnas para cambiar su estado'
                : 'Vista general de todos los tickets del sistema'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="glass-morphism rounded-lg px-3 py-2">
              <span className="text-white/70 text-sm">Total: </span>
              <span className="text-white font-semibold">{Object.values(ticketsByState).flat().length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Error */}
      {dragError && (
        <div className="mb-4 glass-morphism bg-red-500/20 border-red-400/30 rounded-xl p-4 animate-slide-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300 text-sm flex-1">{dragError}</span>
            <button
              onClick={() => setDragError(null)}
              className="ml-3 text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.key}
                column={column}
                tickets={ticketsByState[column.key] || []}
                onTicketClick={handleTicketClick}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

// Kanban Column Component
const KanbanColumn = ({ column, tickets, onTicketClick }) => {
  return (
    <div className="kanban-column flex flex-col h-full glass-morphism rounded-xl border border-white/20">
      {/* Column Header */}
      <div className="kanban-column-header flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="state-indicator w-3 h-3 rounded-full mr-3 shadow-lg"
              style={{ 
                backgroundColor: getStateColor(column.key),
                boxShadow: `0 0 10px ${getStateColor(column.key)}40`
              }}
            />
            <h3 className="font-semibold text-white">{column.label}</h3>
          </div>
          <span className="glass-morphism bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <Droppable droppableId={column.key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`kanban-drop-zone flex-1 p-4 overflow-y-auto transition-all duration-300 ${
              snapshot.isDraggingOver 
                ? 'is-dragging-over bg-gradient-to-b from-purple-500/20 to-transparent' 
                : ''
            }`}
          >
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className={`kanban-empty-state text-center py-12 ${
                  snapshot.isDraggingOver ? 'animate-pulse' : ''
                }`}>
                  <div className="w-16 h-16 glass-morphism rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm">No hay tickets</p>
                  {snapshot.isDraggingOver && (
                    <p className="text-purple-400 text-xs mt-2 animate-bounce">
                      ✨ Suelta aquí para cambiar estado
                    </p>
                  )}
                </div>
              ) : (
                tickets.map((ticket, index) => (
                  <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'ticket-card-dragging rotate-2 scale-105 shadow-2xl z-50' 
                            : 'hover:scale-[1.02] hover:shadow-lg'
                        } ${getPriorityClass(ticket.prioridad)}`}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <TicketCard
                          ticket={ticket}
                          onClick={onTicketClick}
                          showClient={true}
                          showTechnician={false}
                          variant="kanban"
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
}

// Helper function to get state color
const getStateColor = (state) => {
  const colorMap = {
    [TICKET_STATES.ABIERTO]: '#10b981', // emerald
    [TICKET_STATES.EN_PROGRESO]: '#3b82f6', // blue
    [TICKET_STATES.VOBO]: '#f59e0b', // amber
    [TICKET_STATES.CERRADO]: '#8b5cf6' // violet
  }
  return colorMap[state] || '#6b7280'
}

// Helper function to get priority class
const getPriorityClass = (priority) => {
  const priorityClasses = {
    'urgente': 'priority-urgent',
    'alta': 'priority-high',
    'media': 'priority-medium',
    'baja': 'priority-low'
  }
  return priorityClasses[priority] || 'priority-low'
}

export default KanbanBoard