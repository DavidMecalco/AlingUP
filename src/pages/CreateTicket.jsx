import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import TicketForm from '../components/tickets/TicketForm'
import TicketIdDisplay from '../components/tickets/TicketIdDisplay'
import ticketService from '../services/ticketService'

const CreateTicket = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdTicket, setCreatedTicket] = useState(null)

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error } = await ticketService.createTicket(formData, user.id)
      
      if (error) {
        setError(error.message || 'Error al crear el ticket')
        return
      }

      // Success - show created ticket info
      setCreatedTicket(data)
    } catch (error) {
      console.error('Create ticket error:', error)
      setError('Error inesperado al crear el ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/tickets')
  }

  const handleViewTicket = () => {
    navigate(`/tickets/${createdTicket.id}`)
  }

  const handleCreateAnother = () => {
    setCreatedTicket(null)
    setError(null)
  }

  return (
    <AuthenticatedRoute allowedRoles={['cliente', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Crear Nuevo Ticket
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Describe tu problema o solicitud para recibir asistencia técnica
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Success Message */}
            {createdTicket && (
              <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      ¡Ticket creado exitosamente!
                    </h3>
                    <p className="text-sm text-green-700 mb-4">
                      Tu ticket ha sido creado y asignado el siguiente ID para seguimiento:
                    </p>
                    
                    <div className="mb-4">
                      <TicketIdDisplay 
                        ticketNumber={createdTicket.ticket_number} 
                        size="large"
                        showCopyButton={true}
                      />
                    </div>
                    
                    <div className="text-sm text-green-700 mb-4">
                      <p><strong>Título:</strong> {createdTicket.titulo}</p>
                      <p><strong>Prioridad:</strong> {createdTicket.prioridad}</p>
                      <p><strong>Estado:</strong> {createdTicket.estado}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleViewTicket}
                        className="btn-primary"
                      >
                        Ver Ticket
                      </button>
                      <button
                        onClick={handleCreateAnother}
                        className="btn-secondary"
                      >
                        Crear Otro Ticket
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn-secondary"
                      >
                        Ir a Mis Tickets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error al crear ticket
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card - Only show if no ticket created yet */}
            {!createdTicket && (
              <div className="card">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Información del Ticket
                  </h2>
                  <p className="text-sm text-gray-600">
                    Completa todos los campos requeridos. Mientras más detalles proporciones, 
                    más rápido podremos ayudarte a resolver tu problema.
                  </p>
                </div>

                <TicketForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={isSubmitting}
                />
              </div>
            )}

            {/* Help Section - Only show if no ticket created yet */}
            {!createdTicket && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  💡 Consejos para crear un buen ticket
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <div>
                      <strong>Sé específico en el título:</strong> En lugar de "No funciona", usa "Error al iniciar sesión en el sistema de inventario"
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <div>
                      <strong>Incluye pasos para reproducir:</strong> Describe exactamente qué estabas haciendo cuando ocurrió el problema
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <div>
                      <strong>Menciona mensajes de error:</strong> Si aparece algún mensaje de error, cópialo exactamente como aparece
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium">4</span>
                    </div>
                    <div>
                      <strong>Selecciona la prioridad correcta:</strong> Esto nos ayuda a atender primero los problemas más críticos
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}

export default CreateTicket