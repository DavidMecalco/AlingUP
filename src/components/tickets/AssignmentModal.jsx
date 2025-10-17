import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import ticketService from '../../services/ticketService'
import notificationService from '../../services/notificationService'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const AssignmentModal = ({ 
  isOpen, 
  onClose, 
  tickets = [], // Array of tickets for bulk assignment, or single ticket
  onAssignmentComplete 
}) => {
  const { user } = useAuth()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  // Determine if this is bulk assignment
  const isBulkAssignment = Array.isArray(tickets) && tickets.length > 1
  const singleTicket = Array.isArray(tickets) ? tickets[0] : tickets

  useEffect(() => {
    if (isOpen) {
      loadTechnicians()
      setError(null)
      setSelectedTechnician(null)
    }
  }, [isOpen])

  const loadTechnicians = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await userService.getTechniciansWithWorkload()

      if (result.error) {
        setError(result.error.message || 'Error al cargar técnicos')
      } else {
        setTechnicians(result.data)
      }
    } catch (err) {
      console.error('Load technicians error:', err)
      setError('Error al cargar técnicos')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignment = async (tecnicoId) => {
    if (assigning) return

    try {
      setAssigning(true)
      setError(null)

      if (isBulkAssignment) {
        // Bulk assignment
        const assignments = []
        
        for (const ticket of tickets) {
          const result = await ticketService.assignTicket(ticket.id, tecnicoId)
          
          if (result.error) {
            console.error(`Failed to assign ticket ${ticket.id}:`, result.error)
            setError(`Error al asignar ticket ${ticket.ticket_number}: ${result.error.message}`)
            return
          }
          
          assignments.push({
            ticketId: ticket.id,
            tecnicoId: tecnicoId
          })
        }

        // Send bulk notifications
        if (tecnicoId && assignments.length > 0) {
          await notificationService.createBulkAssignmentNotifications(assignments, user.id)
        }

        onAssignmentComplete?.(assignments)
      } else {
        // Single assignment
        const ticketToAssign = Array.isArray(tickets) ? tickets[0] : tickets
        const result = await ticketService.assignTicket(ticketToAssign.id, tecnicoId)

        if (result.error) {
          setError(result.error.message || 'Error al asignar ticket')
          return
        }

        // Send assignment notification
        if (tecnicoId) {
          await notificationService.createAssignmentNotification(
            ticketToAssign.id,
            tecnicoId,
            user.id
          )
        }

        onAssignmentComplete?.(result.data)
      }

      onClose()
    } catch (err) {
      console.error('Assignment error:', err)
      setError('Error al asignar ticket(s)')
    } finally {
      setAssigning(false)
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      baja: 'text-green-600',
      media: 'text-yellow-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600'
    }
    return colors[priority] || colors.media
  }

  const getWorkloadColor = (total) => {
    if (total === 0) return 'text-green-600'
    if (total <= 3) return 'text-yellow-600'
    if (total <= 6) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isBulkAssignment 
                ? `Asignar ${tickets.length} tickets` 
                : `Asignar Ticket #${singleTicket?.ticket_number}`
              }
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Ticket Summary for Bulk Assignment */}
          {isBulkAssignment && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Tickets a asignar:
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-gray-100">
                      #{ticket.ticket_number} - {ticket.titulo}
                    </span>
                    <span className={`font-medium capitalize ${getPriorityColor(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando técnicos...</span>
            </div>
          ) : (
            <>
              {/* Technicians List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {technicians.map(tech => (
                  <button
                    key={tech.id}
                    onClick={() => handleAssignment(tech.id)}
                    disabled={assigning}
                    className={`w-full p-4 text-left rounded-lg border transition-colors disabled:opacity-50 ${
                      singleTicket?.tecnico_id === tech.id
                        ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {tech.nombre_completo}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tech.email}
                        </p>
                        
                        {/* Current Assignment Indicator */}
                        {singleTicket?.tecnico_id === tech.id && (
                          <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-1">
                            Asignado actualmente
                          </p>
                        )}
                      </div>

                      {/* Workload Summary */}
                      <div className="ml-4 text-right">
                        <p className={`text-sm font-medium ${getWorkloadColor(tech.workload.total)}`}>
                          {tech.workload.total} tickets activos
                        </p>
                        
                        {tech.workload.total > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div className="flex space-x-2">
                              <span>A: {tech.workload.abierto}</span>
                              <span>P: {tech.workload.en_progreso}</span>
                              <span>V: {tech.workload.vobo}</span>
                            </div>
                            
                            {/* Priority Breakdown */}
                            <div className="flex space-x-1 mt-1">
                              {tech.workload.byPriority.urgente > 0 && (
                                <span className="text-red-600">U:{tech.workload.byPriority.urgente}</span>
                              )}
                              {tech.workload.byPriority.alta > 0 && (
                                <span className="text-orange-600">A:{tech.workload.byPriority.alta}</span>
                              )}
                              {tech.workload.byPriority.media > 0 && (
                                <span className="text-yellow-600">M:{tech.workload.byPriority.media}</span>
                              )}
                              {tech.workload.byPriority.baja > 0 && (
                                <span className="text-green-600">B:{tech.workload.byPriority.baja}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Unassign Option */}
                {!isBulkAssignment && singleTicket?.tecnico_id && (
                  <button
                    onClick={() => handleAssignment(null)}
                    disabled={assigning}
                    className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Sin asignar
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Remover asignación actual
                        </p>
                      </div>
                      <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  disabled={assigning}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>

              {/* Loading Overlay */}
              {assigning && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {isBulkAssignment ? 'Asignando tickets...' : 'Asignando ticket...'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentModal