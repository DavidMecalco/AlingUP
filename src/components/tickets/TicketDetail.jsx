import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ticketService from '../../services/ticketService'
import { supabase } from '../../services/supabaseClient'
import AttachmentDisplay from '../attachments/AttachmentDisplay'
// import CommentList from '../comments/CommentList'
// import CommentForm from '../comments/CommentForm'
import Timeline from './Timeline'
import StateTransitionControl from './StateTransitionControl'
import AssignmentModal from './AssignmentModal'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const TicketDetail = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    if (ticketId) {
      loadTicket()
    }
  }, [ticketId, user])

  const loadTicket = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await ticketService.getTicketById(ticketId)
      
      if (result.error) {
        setError(result.error.message || 'Error al cargar el ticket')
      } else {
        setTicket(result.data)
      }
    } catch (err) {
      console.error('Load ticket error:', err)
      setError('Error al cargar el ticket')
    } finally {
      setLoading(false)
    }
  }



  const handleStateChange = (updatedTicket) => {
    setTicket(updatedTicket)
  }

  const handleAssignmentComplete = (result) => {
    if (Array.isArray(result)) {
      // Bulk assignment result - reload ticket
      loadTicket()
    } else {
      // Single assignment result
      setTicket(result)
    }
    setShowAssignModal(false)
  }

  const getPriorityColor = (priority) => {
    const colors = {
      baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return colors[priority] || colors.media
  }

  const getStateColor = (state) => {
    const colors = {
      abierto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      en_progreso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      vobo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      cerrado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return colors[state] || colors.abierto
  }

  const getStateLabel = (state) => {
    const labels = {
      abierto: 'Abierto',
      en_progreso: 'En Progreso',
      vobo: 'VoBo',
      cerrado: 'Cerrado'
    }
    return labels[state] || state
  }

  const canAssignTicket = () => {
    return user?.profile?.rol === 'admin'
  }

  const handleCommentAdded = (newComment) => {
    console.log('New comment added:', newComment)
    // The CommentList component will handle real-time updates
  }

  const handleCommentCountChange = (count) => {
    setCommentCount(count)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando ticket...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadTicket}
              className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Ticket no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">El ticket solicitado no existe o no tienes permisos para verlo.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {ticket.titulo}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ticket #{ticket.ticket_number}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {canAssignTicket() && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {ticket.tecnico ? 'Reasignar' : 'Asignar'}
                </button>
              )}
              
              {/* State Transition Control */}
              <StateTransitionControl
                ticket={ticket}
                onStateChange={handleStateChange}
                disabled={updating}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ticket Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Información del Ticket
              </h2>
              
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <div 
                    className="comment-content p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    dangerouslySetInnerHTML={{ __html: ticket.descripcion }}
                  />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateColor(ticket.estado)}`}>
                      {getStateLabel(ticket.estado)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prioridad
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {ticket.tipo_ticket?.nombre || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cliente
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {ticket.cliente?.nombre_completo}
                    </p>
                    {ticket.cliente?.empresa_cliente && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.cliente.empresa_cliente}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Técnico Asignado
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {ticket.tecnico?.nombre_completo || 'Sin asignar'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creado
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDistanceToNow(new Date(ticket.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Archivos Adjuntos
              </h2>
              <AttachmentDisplay ticketId={ticket.id} />
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Comentarios
              </h2>
              
              {/* Comment Form */}
              <div className="mb-6">
                <div className="text-center py-4 text-gray-500">
                  Comment system temporarily disabled for build
                </div>
                {/* <CommentForm 
                  ticketId={ticket.id} 
                  onCommentAdded={handleCommentAdded}
                /> */}
              </div>
              
              {/* Comments List */}
              <div className="text-center py-4 text-gray-500">
                Comments list temporarily disabled for build
              </div>
              {/* <CommentList 
                ticketId={ticket.id}
                onCommentCountChange={handleCommentCountChange}
              /> */}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                {/* State Transition Control */}
                <StateTransitionControl
                  ticket={ticket}
                  onStateChange={handleStateChange}
                  disabled={updating}
                  className="w-full"
                />
                
                {canAssignTicket() && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={updating}
                    className="w-full px-4 py-2 text-left text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {ticket.tecnico ? 'Reasignar Técnico' : 'Asignar Técnico'}
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Estadísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Comentarios</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {commentCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateColor(ticket.estado)}`}>
                    {getStateLabel(ticket.estado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Timeline de Actividad
              </h3>
              
              <Timeline ticketId={ticketId} />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        tickets={ticket}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </div>
  )
}

export default TicketDetail