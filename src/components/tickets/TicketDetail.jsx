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
import GlassCard from '../common/GlassCard'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  PlayCircle, 
  XCircle,
  Wrench,
  Building,
  Calendar,
  MessageSquare,
  Paperclip,
  Activity,
  BarChart3
} from 'lucide-react'
import '../../styles/glass.css'

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

  const getPriorityConfig = (priority) => {
    const configs = {
      baja: { 
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
      },
      media: { 
        color: 'bg-blue-100 text-blue-900 border-blue-300',
        icon: <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      },
      alta: { 
        color: 'bg-orange-100 text-orange-900 border-orange-300',
        icon: <div className="w-2 h-2 rounded-full bg-orange-600"></div>
      },
      urgente: { 
        color: 'bg-red-100 text-red-900 border-red-300',
        icon: <div className="w-2 h-2 rounded-full bg-red-600"></div>
      }
    }
    return configs[priority] || configs.media
  }

  const getStateConfig = (state) => {
    const configs = {
      abierto: { 
        color: 'bg-blue-100 text-blue-900 border-blue-300',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Abierto'
      },
      en_progreso: { 
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: <PlayCircle className="w-4 h-4" />,
        label: 'En Progreso'
      },
      vobo: { 
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'VoBo'
      },
      cerrado: { 
        color: 'bg-slate-100 text-slate-900 border-slate-300',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Cerrado'
      }
    }
    return configs[state] || configs.abierto
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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassCard className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg">Cargando ticket...</p>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassCard variant="error" className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadTicket}
              className="glass-button px-6 py-3 rounded-xl text-gray-900 font-medium bg-blue-100 hover:bg-blue-200 transition-all duration-200"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => navigate(-1)}
              className="glass-button px-6 py-3 rounded-xl text-gray-800 hover:text-gray-900 font-medium glass-subtle hover:glass transition-all duration-200"
            >
              Volver
            </button>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassCard className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Ticket no encontrado</h2>
          <p className="text-white/80 mb-6">El ticket solicitado no existe o no tienes permisos para verlo.</p>
          <button
            onClick={() => navigate(-1)}
            className="glass-button px-6 py-3 rounded-xl text-gray-900 font-medium bg-blue-100 hover:bg-blue-200 transition-all duration-200"
          >
            Volver
          </button>
        </GlassCard>
      </div>
    )
  }

  const priorityConfig = getPriorityConfig(ticket.prioridad)
  const stateConfig = getStateConfig(ticket.estado)

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <GlassCard className="animate-slide-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="glass-button p-3 rounded-2xl text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white font-mono text-sm rounded-lg border border-white/30">
                  #{ticket.ticket_number}
                </span>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${stateConfig.color}`}>
                  {stateConfig.icon}
                  <span>{stateConfig.label}</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${priorityConfig.color}`}>
                  {priorityConfig.icon}
                  <span className="capitalize">{ticket.prioridad}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {ticket.titulo}
              </h1>
              <p className="text-gray-700">
                Creado {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {canAssignTicket() && (
              <button
                onClick={() => setShowAssignModal(true)}
                disabled={updating}
                className="glass-button px-6 py-3 rounded-xl text-gray-900 font-medium bg-blue-100 hover:bg-blue-200 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Wrench className="w-4 h-4" />
                <span>{ticket.tecnico ? 'Reasignar' : 'Asignar'}</span>
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
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ticket Information */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Información del Ticket
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Descripción
                </label>
                <div className="glass-subtle rounded-xl p-4">
                  <div 
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: ticket.descripcion }}
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/30">
                {/* Tipo */}
                <div className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Tipo</p>
                      <p className="text-slate-800 font-medium">
                        {ticket.tipo_ticket?.nombre || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Cliente</p>
                      <p className="text-slate-800 font-medium">
                        {ticket.cliente?.nombre_completo}
                      </p>
                      {ticket.cliente?.empresa_cliente && (
                        <p className="text-slate-600 text-xs">
                          {ticket.cliente.empresa_cliente}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Técnico */}
                <div className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Técnico Asignado</p>
                      <p className="text-slate-800 font-medium">
                        {ticket.tecnico?.nombre_completo || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fecha de creación */}
                <div className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Creado</p>
                      <p className="text-slate-800 font-medium">
                        {formatDistanceToNow(new Date(ticket.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {new Date(ticket.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Attachments */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-emerald-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Archivos Adjuntos
              </h2>
            </div>
            <div className="glass-subtle rounded-xl p-4">
              <AttachmentDisplay ticketId={ticket.id} />
            </div>
          </GlassCard>

          {/* Comments Section */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Comentarios
              </h2>
            </div>
            
            {/* Comment Form */}
            <div className="mb-6">
              <div className="glass-subtle rounded-xl p-6 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Sistema de comentarios temporalmente deshabilitado</p>
              </div>
              {/* <CommentForm 
                ticketId={ticket.id} 
                onCommentAdded={handleCommentAdded}
              /> */}
            </div>
            
            {/* Comments List */}
            <div className="glass-subtle rounded-xl p-6 text-center">
              <p className="text-slate-600">Lista de comentarios temporalmente deshabilitada</p>
            </div>
            {/* <CommentList 
              ticketId={ticket.id}
              onCommentCountChange={handleCommentCountChange}
            /> */}
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Acciones Rápidas
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* State Transition Control */}
              <div className="glass-subtle rounded-xl p-3">
                <StateTransitionControl
                  ticket={ticket}
                  onStateChange={handleStateChange}
                  disabled={updating}
                  className="w-full"
                />
              </div>
              
              {canAssignTicket() && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  disabled={updating}
                  className="w-full glass-button px-4 py-3 text-left text-slate-800 glass-subtle hover:glass rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center space-x-3"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{ticket.tecnico ? 'Reasignar Técnico' : 'Asignar Técnico'}</span>
                </button>
              )}
            </div>
          </GlassCard>

          {/* Stats */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Estadísticas
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">Comentarios</span>
                  </div>
                  <span className="text-slate-800 font-medium bg-white/30 px-2 py-1 rounded-lg">
                    {commentCount}
                  </span>
                </div>
              </div>
              
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">Estado</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border ${stateConfig.color}`}>
                    {stateConfig.icon}
                    <span>{stateConfig.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Timeline */}
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Timeline de Actividad
              </h3>
            </div>
            
            <div className="glass-subtle rounded-xl p-4">
              <Timeline ticketId={ticketId} />
            </div>
          </GlassCard>
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