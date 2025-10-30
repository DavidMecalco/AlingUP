import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import TicketForm from '../components/tickets/TicketForm'
import SimpleTicketForm from '../components/tickets/SimpleTicketForm'
import TicketIdDisplay from '../components/tickets/TicketIdDisplay'
import GlassCard from '../components/common/GlassCard'
import AlingUPLogo from '../components/common/AlingUPLogo'
import ticketService from '../services/ticketService'
import simpleTicketService from '../services/ticketServiceSimple'
import ultraSimpleTicketService from '../services/ticketServiceUltraSimple'
import { checkDatabase, createSimpleTicket } from '../utils/checkDatabase'
import { ensureTicketTypesExist } from '../utils/seedTicketTypes'
import { checkRLSStatus, fixRLSPolicies } from '../utils/fixRLS'
import { verifyTicketsTable, getTableColumns, verifyClienteId, checkTicketTypes, createTicketWithValidType } from '../utils/verifyTable'
import { testSimpleInsert } from '../services/supabaseSimple'
import { createTicketDirect, testDirectConnection, createTicketSimple } from '../services/directAPI'
import { inspectUsersTable, createMinimalUser, tryDifferentUserCreation } from '../services/debugAPI'
import { createTicketWithCurrentUser, ensureCurrentUserAsCliente } from '../services/userFixAPI'
import { createBasicTicket } from '../services/basicTicketService'
import { createTestUsers } from '../utils/createTestUsers'
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
  Zap,
  Loader
} from 'lucide-react'
import '../styles/glass.css'

const CreateTicket = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdTicket, setCreatedTicket] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  const handleDebugCheck = async () => {
    console.log('🔍 Running database check...')
    const result = await checkDatabase()
    setDebugInfo(result)
    console.log('Database check result:', result)
  }

  const handleSimpleTest = async () => {
    console.log('🧪 Testing simple ticket creation...')
    const result = await createSimpleTicket('Test Ticket', 'Test Description', user.id)
    console.log('Simple test result:', result)
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleInitTicketTypes = async () => {
    console.log('🎫 Initializing ticket types...')
    const result = await ensureTicketTypesExist()
    console.log('Ticket types init result:', result)
    setDebugInfo(prev => ({ ...prev, ticketTypesInit: result }))
  }

  const handleTestConnection = async () => {
    console.log('🔌 Testing database connection...')
    const result = await ultraSimpleTicketService.testConnection()
    console.log('Connection test result:', result)
    setDebugInfo(prev => ({ ...prev, connectionTest: result }))
  }

  const handleTestPermissions = async () => {
    console.log('🔐 Testing insert permissions...')
    const result = await ultraSimpleTicketService.testInsertPermissions()
    console.log('Permission test result:', result)
    setDebugInfo(prev => ({ ...prev, permissionTest: result }))
  }

  const handleCheckRLS = async () => {
    console.log('🔍 Checking RLS status...')
    const result = await checkRLSStatus()
    console.log('RLS status result:', result)
    setDebugInfo(prev => ({ ...prev, rlsStatus: result }))
  }

  const handleVerifyTable = async () => {
    console.log('🔍 Verifying tickets table...')
    const result = await verifyTicketsTable()
    console.log('Table verification result:', result)
    setDebugInfo(prev => ({ ...prev, tableVerification: result }))
  }

  const handleCheckColumns = async () => {
    console.log('🔍 Checking table columns...')
    const result = await getTableColumns()
    console.log('Column check result:', result)
    setDebugInfo(prev => ({ ...prev, columnCheck: result }))
  }

  const handleVerifyClienteId = async () => {
    console.log('🔍 Verifying cliente_id...')
    const result = await verifyClienteId(user.id)
    console.log('Cliente ID verification result:', result)
    setDebugInfo(prev => ({ ...prev, clienteIdCheck: result }))
  }

  const handleCheckTicketTypes = async () => {
    console.log('🔍 Checking ticket types...')
    const result = await checkTicketTypes()
    console.log('Ticket types check result:', result)
    setDebugInfo(prev => ({ ...prev, ticketTypesCheck: result }))
  }

  const handleCreateWithValidType = async () => {
    console.log('🔧 Creating ticket with valid type...')
    const result = await createTicketWithValidType()
    console.log('Creation with valid type result:', result)
    setDebugInfo(prev => ({ ...prev, withValidType: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleTestSimpleClient = async () => {
    console.log('🧪 Testing simple Supabase client...')
    const result = await testSimpleInsert()
    console.log('Simple client test result:', result)
    setDebugInfo(prev => ({ ...prev, simpleClient: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleTestDirectAPI = async () => {
    console.log('🔌 Testing direct API...')
    const result = await testDirectConnection()
    console.log('Direct API test result:', result)
    setDebugInfo(prev => ({ ...prev, directAPI: result }))
  }

  const handleCreateDirectAPI = async () => {
    console.log('🚀 Creating ticket with direct API...')
    const formData = {
      titulo: 'Test Direct API',
      descripcion: 'Created using direct fetch API',
      prioridad: 'media'
    }
    const result = await createTicketDirect(formData, user.id, user.email)
    console.log('Direct API creation result:', result)
    setDebugInfo(prev => ({ ...prev, directCreation: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleCreateTestUsers = async () => {
    console.log('👥 Creating test users...')
    const result = await createTestUsers()
    console.log('Test users creation result:', result)
    setDebugInfo(prev => ({ ...prev, testUsers: result }))
  }

  const handleCreateSimpleTicket = async () => {
    console.log('🎯 Creating ticket with simple approach...')
    const formData = {
      titulo: 'Simple Test Ticket',
      descripcion: 'Created with simple approach - no user validation',
      prioridad: 'media'
    }
    const result = await createTicketSimple(formData)
    console.log('Simple ticket creation result:', result)
    setDebugInfo(prev => ({ ...prev, simpleCreation: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleInspectUsers = async () => {
    console.log('🔍 Inspecting users table...')
    const result = await inspectUsersTable()
    console.log('Users table inspection result:', result)
    setDebugInfo(prev => ({ ...prev, usersInspection: result }))
  }

  const handleCreateMinimalUser = async () => {
    console.log('👤 Creating minimal user...')
    const result = await createMinimalUser()
    console.log('Minimal user creation result:', result)
    setDebugInfo(prev => ({ ...prev, minimalUser: result }))
  }

  const handleTryDifferentApproaches = async () => {
    console.log('🧪 Trying different user creation approaches...')
    const result = await tryDifferentUserCreation()
    console.log('Different approaches result:', result)
    setDebugInfo(prev => ({ ...prev, differentApproaches: result }))
  }

  const handleCreateTicketWithCurrentUser = async () => {
    console.log('🎫 Creating ticket with current user...')
    const formData = {
      titulo: 'Ticket with Current User',
      descripcion: 'Created using current user as cliente',
      prioridad: 'media'
    }
    const result = await createTicketWithCurrentUser(formData, user.id, user.email)
    console.log('Current user ticket creation result:', result)
    setDebugInfo(prev => ({ ...prev, currentUserTicket: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleCreateTicketAuthenticated = async () => {
    console.log('🔐 Creating ticket with authenticated client...')
    const formData = {
      titulo: 'Authenticated Ticket',
      descripcion: 'Created using authenticated Supabase client',
      prioridad: 'media'
    }
    const result = await createTicketAuthenticated(formData, user.id, user.email)
    console.log('Authenticated ticket creation result:', result)
    setDebugInfo(prev => ({ ...prev, authenticatedTicket: result }))
    if (result.success) {
      setCreatedTicket(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  const handleCheckSession = async () => {
    console.log('🔍 Checking user session...')
    const result = await checkUserSession()
    console.log('Session check result:', result)
    setDebugInfo(prev => ({ ...prev, sessionCheck: result }))
  }

  const handleCreateBasicTicket = async () => {
    console.log('📝 Creando ticket básico...')
    const result = await createBasicTicket(
      'Ticket de Prueba',
      'Este es un ticket creado con el método básico',
      'media'
    )
    
    if (result.success) {
      setCreatedTicket(result.ticket)
      setError(null)
      console.log('✅ Ticket creado exitosamente')
    } else {
      setError(result.error)
      console.log('❌ Error creando ticket:', result.error)
    }
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Creating ticket with data:', formData)
      console.log('User ID:', user.id)
      
      // Direct call without timeout for debugging
      const result = await ultraSimpleTicketService.createTicket(formData, user.id)
      const { data, error } = result
      
      console.log('Create ticket response:', { data, error })
      
      if (error) {
        console.error('Service returned error:', error)
        setError(error.message || 'Error al crear el ticket')
        return
      }

      if (!data) {
        setError('No se recibió respuesta del servidor')
        return
      }

      console.log('Ticket created successfully:', data)
      // Success - show created ticket info
      setCreatedTicket(data)
    } catch (error) {
      console.error('Create ticket error:', error)
      setError(error.message || 'Error inesperado al crear el ticket')
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

              </div>
            </div>
          </GlassCard>
        )}

        {/* Form Card - Only show if no ticket created yet */}
        {!createdTicket && (
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

            {/* Debug buttons - temporary */}
            <div className="mb-6 p-4 glass-morphism rounded-xl border border-yellow-400/30 bg-yellow-500/10">
              <h4 className="text-yellow-400 font-medium mb-3">Debug Tools</h4>
              <p className="text-green-300/80 text-sm mb-3">
                🔄 Empezando de cero con enfoque simple<br/>
                💡 Haz clic en "✅ Crear Ticket Básico" para probar
              </p>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={handleCreateBasicTicket}
                  className="glass-button px-3 py-2 rounded-lg text-white bg-green-500/20 hover:bg-green-500/30 transition-colors text-sm font-medium"
                >
                  ✅ Crear Ticket Básico
                </button>
              </div>
              {debugInfo && (
                <div className="mt-3 p-3 glass-morphism rounded-lg">
                  <pre className="text-xs text-white/70 overflow-auto max-h-32">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <SimpleTicketForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </GlassCard>
        )}

        {/* Help Section - Only show if no ticket created yet */}
        {!createdTicket && (
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
  )
}

export default CreateTicket