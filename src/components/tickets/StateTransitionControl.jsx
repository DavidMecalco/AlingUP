import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import ticketService from '../../services/ticketService'
import notificationService from '../../services/notificationService'
import timelineService from '../../services/timelineService'

const StateTransitionControl = ({ 
  ticket, 
  onStateChange, 
  disabled = false,
  className = '' 
}) => {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingState, setPendingState] = useState(null)
  const [error, setError] = useState(null)

  // Define valid state transitions
  const stateTransitions = {
    abierto: ['en_progreso'],
    en_progreso: ['vobo', 'abierto'],
    vobo: ['cerrado', 'en_progreso'],
    cerrado: [] // Closed tickets cannot be changed
  }

  // State labels for display
  const stateLabels = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    vobo: 'VoBo',
    cerrado: 'Cerrado'
  }

  // State colors
  const stateColors = {
    abierto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    en_progreso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    vobo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    cerrado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  // Check if user can change state
  const canChangeState = () => {
    if (!user || !ticket || disabled) return false
    
    // Admins can change any state
    if (user.profile?.rol === 'admin') return true
    
    // Technicians can only change state of assigned tickets
    if (user.profile?.rol === 'tecnico' && ticket.tecnico_id === user.id) return true
    
    return false
  }

  // Get available next states
  const getNextStates = () => {
    return stateTransitions[ticket?.estado] || []
  }

  // Check if state change requires confirmation
  const requiresConfirmation = (newState) => {
    return newState === 'cerrado'
  }

  // Get confirmation message for state change
  const getConfirmationMessage = (newState) => {
    const messages = {
      cerrado: '¿Estás seguro de que quieres cerrar este ticket? Esta acción marcará el ticket como resuelto.'
    }
    return messages[newState] || `¿Confirmas el cambio de estado a "${stateLabels[newState]}"?`
  }

  const handleStateChangeRequest = (newState) => {
    if (updating || !canChangeState()) return

    setError(null)

    if (requiresConfirmation(newState)) {
      setPendingState(newState)
      setShowConfirmDialog(true)
    } else {
      executeStateChange(newState)
    }
  }

  const executeStateChange = async (newState) => {
    if (!ticket || updating) return

    try {
      setUpdating(true)
      setError(null)

      const oldState = ticket.estado

      // Update ticket state
      const result = await ticketService.changeTicketState(ticket.id, newState)

      if (result.error) {
        setError(result.error.message || 'Error al cambiar el estado')
        return
      }

      // Create timeline entry
      await timelineService.createEvent(ticket.id, 'state_change', {
        old_state: oldState,
        new_state: newState,
        changed_by: user.id
      })

      // Send notifications
      await notificationService.createStateChangeNotification(
        ticket.id,
        oldState,
        newState,
        user.id
      )

      // Notify parent component
      onStateChange?.(result.data)

    } catch (err) {
      console.error('State change error:', err)
      setError('Error al cambiar el estado')
    } finally {
      setUpdating(false)
      setShowConfirmDialog(false)
      setPendingState(null)
    }
  }

  const handleConfirmStateChange = () => {
    if (pendingState) {
      executeStateChange(pendingState)
    }
  }

  const handleCancelStateChange = () => {
    setShowConfirmDialog(false)
    setPendingState(null)
    setError(null)
  }

  if (!ticket || !canChangeState()) {
    return (
      <div className={className}>
        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${stateColors[ticket?.estado]}`}>
          {stateLabels[ticket?.estado]}
        </span>
      </div>
    )
  }

  const nextStates = getNextStates()

  if (nextStates.length === 0) {
    return (
      <div className={className}>
        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${stateColors[ticket.estado]}`}>
          {stateLabels[ticket.estado]}
        </span>
      </div>
    )
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Current State Display */}
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${stateColors[ticket.estado]}`}>
            {stateLabels[ticket.estado]}
          </span>

          {/* State Change Dropdown */}
          <div className="relative">
            <select
              value=""
              onChange={(e) => e.target.value && handleStateChangeRequest(e.target.value)}
              disabled={updating || disabled}
              className="px-3 py-1 text-sm bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="">Cambiar a...</option>
              {nextStates.map(state => (
                <option key={state} value={state} className="text-gray-900">
                  {stateLabels[state]}
                </option>
              ))}
            </select>
            <svg className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Loading Indicator */}
          {updating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fuchsia-500"></div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Quick Action Buttons (Alternative UI) */}
        <div className="mt-2 flex flex-wrap gap-2">
          {nextStates.map(state => (
            <button
              key={state}
              onClick={() => handleStateChangeRequest(state)}
              disabled={updating || disabled}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                state === 'cerrado'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              → {stateLabels[state]}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancelStateChange}></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Confirmar Cambio de Estado
                </h3>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {getConfirmationMessage(pendingState)}
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estado actual:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stateColors[ticket.estado]}`}>
                      {stateLabels[ticket.estado]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Nuevo estado:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stateColors[pendingState]}`}>
                      {stateLabels[pendingState]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelStateChange}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmStateChange}
                  disabled={updating}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                    pendingState === 'cerrado'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-fuchsia-600 hover:bg-fuchsia-700'
                  }`}
                >
                  {updating ? 'Cambiando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StateTransitionControl