import { useState } from 'react'
import AssignmentModal from './AssignmentModal'

const BulkAssignmentPanel = ({ 
  selectedTickets = [], 
  onSelectionChange, 
  onAssignmentComplete,
  className = '' 
}) => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)

  const handleSelectAll = (tickets) => {
    if (selectedTickets.length === tickets.length) {
      // Deselect all
      onSelectionChange([])
    } else {
      // Select all
      onSelectionChange(tickets)
    }
  }

  const handleTicketToggle = (ticket) => {
    const isSelected = selectedTickets.some(t => t.id === ticket.id)
    
    if (isSelected) {
      onSelectionChange(selectedTickets.filter(t => t.id !== ticket.id))
    } else {
      onSelectionChange([...selectedTickets, ticket])
    }
  }

  const handleBulkAssignment = () => {
    if (selectedTickets.length > 0) {
      setShowAssignmentModal(true)
    }
  }

  const handleAssignmentModalComplete = (result) => {
    setShowAssignmentModal(false)
    onSelectionChange([]) // Clear selection after assignment
    onAssignmentComplete?.(result)
  }

  if (selectedTickets.length === 0) {
    return null
  }

  return (
    <>
      {/* Bulk Actions Panel */}
      <div className={`bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">
                {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} seleccionado{selectedTickets.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Selected Tickets Summary */}
            <div className="hidden sm:flex items-center space-x-4 text-xs text-fuchsia-700 dark:text-fuchsia-300">
              {/* Priority Breakdown */}
              {['urgente', 'alta', 'media', 'baja'].map(priority => {
                const count = selectedTickets.filter(t => t.prioridad === priority).length
                if (count === 0) return null
                
                const colors = {
                  urgente: 'text-red-600 dark:text-red-400',
                  alta: 'text-orange-600 dark:text-orange-400',
                  media: 'text-yellow-600 dark:text-yellow-400',
                  baja: 'text-green-600 dark:text-green-400'
                }
                
                return (
                  <span key={priority} className={colors[priority]}>
                    {priority}: {count}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkAssignment}
              className="px-4 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 transition-colors"
            >
              Asignar Seleccionados
            </button>
            
            <button
              onClick={() => onSelectionChange([])}
              className="px-3 py-2 text-fuchsia-600 dark:text-fuchsia-400 text-sm font-medium hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Selected Tickets List (Mobile) */}
        <div className="sm:hidden mt-3 pt-3 border-t border-fuchsia-200 dark:border-fuchsia-800">
          <div className="space-y-1">
            {selectedTickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="text-xs text-fuchsia-700 dark:text-fuchsia-300">
                #{ticket.ticket_number} - {ticket.titulo.substring(0, 30)}
                {ticket.titulo.length > 30 && '...'}
              </div>
            ))}
            {selectedTickets.length > 3 && (
              <div className="text-xs text-fuchsia-600 dark:text-fuchsia-400">
                y {selectedTickets.length - 3} más...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        tickets={selectedTickets}
        onAssignmentComplete={handleAssignmentModalComplete}
      />
    </>
  )
}

export default BulkAssignmentPanel