import React, { useState } from 'react'
import Timeline from './Timeline'
import { useTimeline } from '../../hooks/useTimeline'
import { useAuth } from '../../hooks/useAuth'

/**
 * Demo component showing how to use the Timeline functionality
 * This component demonstrates all the timeline features and event types
 */
const TimelineDemo = ({ ticketId }) => {
  const { user } = useAuth()
  const {
    events,
    loading,
    error,
    createTicketAssignedEvent,
    createStateChangedEvent,
    createCommentAddedEvent,
    createFileUploadedEvent,
    createTicketClosedEvent,
    createTicketReopenedEvent,
    refresh
  } = useTimeline(ticketId)

  const [demoLoading, setDemoLoading] = useState(false)

  /**
   * Demo function to create a sample assignment event
   */
  const handleDemoAssignment = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createTicketAssignedEvent(
        'demo-tech-id',
        'Juan Pérez (Técnico)',
        user.id
      )
    } catch (error) {
      console.error('Demo assignment error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  /**
   * Demo function to create a sample state change event
   */
  const handleDemoStateChange = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createStateChangedEvent('abierto', 'en_progreso', user.id)
    } catch (error) {
      console.error('Demo state change error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  /**
   * Demo function to create a sample comment event
   */
  const handleDemoComment = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createCommentAddedEvent(user.id, user.profile?.nombre_completo || 'Usuario Demo')
    } catch (error) {
      console.error('Demo comment error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  /**
   * Demo function to create a sample file upload event
   */
  const handleDemoFileUpload = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createFileUploadedEvent(user.id, 'screenshot.png', 'foto')
    } catch (error) {
      console.error('Demo file upload error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  /**
   * Demo function to create a sample ticket closure event
   */
  const handleDemoTicketClosure = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createTicketClosedEvent(user.id)
    } catch (error) {
      console.error('Demo ticket closure error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  /**
   * Demo function to create a sample ticket reopen event
   */
  const handleDemoTicketReopen = async () => {
    if (!user) return
    
    setDemoLoading(true)
    try {
      await createTicketReopenedEvent(user.id)
    } catch (error) {
      console.error('Demo ticket reopen error:', error)
    } finally {
      setDemoLoading(false)
    }
  }

  if (!ticketId) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Por favor proporciona un ID de ticket para ver el timeline demo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Timeline Demo Controls
        </h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          Usa estos botones para crear eventos de ejemplo en el timeline:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={handleDemoAssignment}
            disabled={demoLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Asignar Ticket
          </button>
          
          <button
            onClick={handleDemoStateChange}
            disabled={demoLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Cambiar Estado
          </button>
          
          <button
            onClick={handleDemoComment}
            disabled={demoLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Agregar Comentario
          </button>
          
          <button
            onClick={handleDemoFileUpload}
            disabled={demoLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Subir Archivo
          </button>
          
          <button
            onClick={handleDemoTicketClosure}
            disabled={demoLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Cerrar Ticket
          </button>
          
          <button
            onClick={handleDemoTicketReopen}
            disabled={demoLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Reabrir Ticket
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Total de eventos: {events.length}
          </p>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Timeline Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline de Eventos
        </h3>
        
        <Timeline ticketId={ticketId} />
      </div>

      {/* Event Types Legend */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Tipos de Eventos Disponibles
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🎫</span>
            <span className="text-gray-700 dark:text-gray-300">Ticket Creado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">👤</span>
            <span className="text-gray-700 dark:text-gray-300">Ticket Asignado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">🔄</span>
            <span className="text-gray-700 dark:text-gray-300">Estado Cambiado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">💬</span>
            <span className="text-gray-700 dark:text-gray-300">Comentario Agregado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">📎</span>
            <span className="text-gray-700 dark:text-gray-300">Archivo Subido</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">✅</span>
            <span className="text-gray-700 dark:text-gray-300">Ticket Cerrado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">🔓</span>
            <span className="text-gray-700 dark:text-gray-300">Ticket Reabierto</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineDemo