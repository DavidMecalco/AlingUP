import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import DatabaseInitializer from '../components/setup/DatabaseInitializer'
import TicketForm from '../components/tickets/TicketForm'
import TicketIdDisplay from '../components/tickets/TicketIdDisplay'
import GlassCard from '../components/common/GlassCard'
import AlingUPLogo from '../components/common/AlingUPLogo'
import ticketService from '../services/ticketService'
import { 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Target,
  MessageSquare,
  AlertCircle,
  Zap
} from 'lucide-react'
import '../styles/glass.css'

const CreateTicket = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading: profileLoading, error: profileError, hasValidProfile, refreshProfile } = useUserProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdTicket, setCreatedTicket] = useState(null)
  const [databaseReady, setDatabaseReady] = useState(false)

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
      <DatabaseInitializer onInitialized={setDatabaseReady}>
        <div className="min-h-screen p-6 space-y-8">
        {/* Hero Header */}
        <GlassCard className="animate-slide-in relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-green-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Crear Nuevo Ticket
                  </h1>
                  <p className="text-white/70">
                    Describe tu problema para recibir asistencia especializada
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="glass-button p-3 rounded-2xl text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-all duration-200"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">Respuesta Rápida</p>
                <p className="text-white/60 text-sm">&lt; 2 horas</p>
              </div>
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Soporte 24/7</p>
                <p className="text-white/60 text-sm">Siempre disponible</p>
              </div>
              <div className="glass-morphism rounded-2xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">98% Satisfacción</p>
                <p className="text-white/60 text-sm">Clientes felices</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Success Message */}
        {createdTicket && (
          <GlassCard variant="success" className="animate-slide-in relative overflow-hidden">
            {/* Celebration effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
            
            <div className="relative z-10">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ¡Ticket Creado Exitosamente!
                  </h3>
                  <p className="text-white/80 mb-4">
                    Tu solicitud ha sido registrada y nuestro equipo la atenderá pronto
                  </p>
                  
                  <div className="glass-morphism rounded-2xl p-4 mb-6">
                    <TicketIdDisplay 
                      ticketNumber={createdTicket.ticket_number} 
                      size="large"
                      showCopyButton={true}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass-morphism rounded-xl p-3">
                      <p className="text-white/70 text-sm">Título</p>
                      <p className="text-white font-medium">{createdTicket.titulo}</p>
                    </div>
                    <div className="glass-morphism rounded-xl p-3">
                      <p className="text-white/70 text-sm">Prioridad</p>
                      <p className="text-white font-medium capitalize">{createdTicket.prioridad}</p>
                    </div>
                    <div className="glass-morphism rounded-xl p-3">
                      <p className="text-white/70 text-sm">Estado</p>
                      <p className="text-white font-medium capitalize">{createdTicket.estado}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleViewTicket}
                      className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Ticket</span>
                    </button>
                    <button
                      onClick={handleCreateAnother}
                      className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear Otro</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="glass-button px-6 py-3 rounded-2xl text-white font-medium bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Mis Tickets</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
        {/* Profile Status */}
        {profileLoading && (
          <GlassCard className="animate-slide-in">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Loader className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  Verificando perfil de usuario...
                </h3>
                <p className="text-white/70">Esto puede tomar unos segundos</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Profile Error */}
        {profileError && (
          <GlassCard variant="error" className="animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    Error en el perfil de usuario
                  </h3>
                  <p className="text-white/80">{profileError}</p>
                </div>
              </div>
              <button
                onClick={refreshProfile}
                className="glass-button px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        )}

        {/* Profile Info */}
        {profile && !hasValidProfile && (
          <GlassCard variant="warning" className="animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    Perfil no autorizado
                  </h3>
                  <p className="text-white/80">
                    Tu rol actual ({profile.rol}) no permite crear tickets. Contacta al administrador.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Error Message */}
        {error && (
          <GlassCard variant="error" className="animate-slide-in">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-2">
                  Error al crear ticket
                </h3>
                <p className="text-white/80">{error}</p>
                {error.includes('Cliente ID must reference') && (
                  <button
                    onClick={refreshProfile}
                    className="mt-2 glass-button px-4 py-2 rounded-xl text-white text-sm hover:bg-white/10 transition-colors"
                  >
                    Actualizar perfil
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Form Card - Only show if no ticket created yet and profile is valid */}
        {!createdTicket && !profileLoading && hasValidProfile && (
          <GlassCard className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Información del Ticket
                </h2>
                <p className="text-white/70 text-sm">
                  Completa los detalles para una asistencia más efectiva
                </p>
              </div>
            </div>

            <TicketForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </GlassCard>
        )}

        {/* Help Section - Only show if no ticket created yet and profile is valid */}
        {!createdTicket && !profileLoading && hasValidProfile && (
          <GlassCard variant="primary" className="animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Consejos para un Ticket Efectivo
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-morphism rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Título Específico</h4>
                    <p className="text-white/70 text-sm">
                      En lugar de "No funciona", usa "Error al iniciar sesión en el sistema"
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Pasos Detallados</h4>
                    <p className="text-white/70 text-sm">
                      Describe exactamente qué estabas haciendo cuando ocurrió el problema
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Mensajes de Error</h4>
                    <p className="text-white/70 text-sm">
                      Copia exactamente cualquier mensaje de error que aparezca
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Prioridad Correcta</h4>
                    <p className="text-white/70 text-sm">
                      Selecciona la prioridad adecuada para una atención oportuna
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
        </div>
      </DatabaseInitializer>
    </AuthenticatedRoute>
  )
}

export default CreateTicket