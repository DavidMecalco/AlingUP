import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { TICKET_STATES, STATE_CONFIG, STATE_TRANSITIONS } from '../../utils/constants'
import TicketCard from './TicketCard'
import { useTickets } from '../../hooks/useTickets'
import { useAuth } from '../../hooks/useAuth'

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
    if (user?.rol === 'admin') {
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
    if (user?.rol === 'tecnico') {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando tickets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={refresh}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {user?.rol === 'tecnico' ? 'Mis Tickets Asignados' : 'Tablero Kanban'}
        </h2>
        <p className="text-gray-600">
          {user?.rol === 'tecnico' 
            ? 'Gestiona tus tickets asignados arrastrándolos entre columnas'
            : 'Vista general de todos los tickets del sistema'
          }
        </p>
      </div>

      {/* Drag Error */}
      {dragError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 text-sm">{dragError}</span>
            <button
              onClick={() => setDragError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
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
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200">
      {/* Column Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getStateColor(column.key) }}
            />
            <h3 className="font-semibold text-gray-900">{column.label}</h3>
          </div>
          <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
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
            className={`flex-1 p-4 overflow-y-auto transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-primary-50' : ''
            }`}
          >
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 text-sm">No hay tickets</p>
                </div>
              ) : (
                tickets.map((ticket, index) => (
                  <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-transform duration-200 ${
                          snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <TicketCard
                          ticket={ticket}
                          onClick={onTicketClick}
                          showClient={true}
                          showTechnician={false}
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
    [TICKET_STATES.ABIERTO]: '#10b981', // green
    [TICKET_STATES.EN_PROGRESO]: '#3b82f6', // blue
    [TICKET_STATES.VOBO]: '#f59e0b', // yellow
    [TICKET_STATES.CERRADO]: '#6b7280' // gray
  }
  return colorMap[state] || '#6b7280'
}

export default KanbanBoard