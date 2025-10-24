import { useState, useEffect } from 'react'
import { initializeDatabase } from '../../utils/initializeDatabase'
import { ensureTicketTypesExist } from '../../utils/seedTicketTypes'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertTriangle,
  RefreshCw,
  User,
  Settings
} from 'lucide-react'

const DatabaseInitializer = ({ onInitialized, children }) => {
  const [status, setStatus] = useState({
    stage: 'checking', // checking, initializing, complete, error
    message: 'Verificando configuración...',
    details: null,
    canRetry: false
  })

  const runInitialization = async () => {
    try {
      setStatus({
        stage: 'checking',
        message: 'Verificando configuración...',
        details: null,
        canRetry: false
      })

      console.log('Starting simplified initialization...')

      // Just ensure ticket types exist - this is the most critical part
      setStatus({
        stage: 'initializing',
        message: 'Configurando tipos de tickets...',
        details: null,
        canRetry: false
      })

      const ticketTypesResult = await ensureTicketTypesExist()
      console.log('Ticket types result:', ticketTypesResult)
      
      if (ticketTypesResult.success) {
        console.log('Initialization successful!')
        setStatus({
          stage: 'complete',
          message: 'Sistema listo para usar',
          details: { ticketTypes: ticketTypesResult },
          canRetry: false
        })
        
        // Small delay to show success message
        setTimeout(() => {
          onInitialized?.(true)
        }, 1000)
      } else {
        console.log('Ticket types initialization failed:', ticketTypesResult.message)
        setStatus({
          stage: 'error',
          message: 'Error configurando tipos de tickets',
          details: { error: ticketTypesResult.message },
          canRetry: true
        })
        
        onInitialized?.(false)
      }

    } catch (error) {
      console.error('Initialization error:', error)
      setStatus({
        stage: 'error',
        message: `Error inesperado: ${error.message}`,
        details: { error: error.message },
        canRetry: true
      })
      
      onInitialized?.(false)
    }
  }

  useEffect(() => {
    runInitialization()
  }, [])

  const handleRetry = () => {
    runInitialization()
  }

  const getStageIcon = () => {
    switch (status.stage) {
      case 'checking':
      case 'initializing':
        return <Loader className="w-6 h-6 animate-spin text-blue-400" />
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />
      default:
        return <Database className="w-6 h-6 text-gray-400" />
    }
  }

  const getStageColor = () => {
    switch (status.stage) {
      case 'checking':
      case 'initializing':
        return 'border-blue-400/50 bg-blue-500/10'
      case 'complete':
        return 'border-green-400/50 bg-green-500/10'
      case 'error':
        return 'border-red-400/50 bg-red-500/10'
      default:
        return 'border-gray-400/50 bg-gray-500/10'
    }
  }

  // If initialization is complete, render children
  if (status.stage === 'complete') {
    return children
  }

  // Otherwise, show initialization UI
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className={`glass-morphism rounded-2xl p-8 max-w-md w-full border ${getStageColor()}`}>
        <div className="text-center">
          <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center mx-auto mb-6">
            {getStageIcon()}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Configurando Sistema
          </h2>
          
          <p className="text-white/80 mb-6">
            {status.message}
          </p>

          {status.stage === 'initializing' && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <Database className="w-4 h-4" />
                <span>Verificando tablas de base de datos</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <User className="w-4 h-4" />
                <span>Configurando perfil de usuario</span>
                <Loader className="w-4 h-4 animate-spin text-blue-400" />
              </div>
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <Settings className="w-4 h-4" />
                <span>Inicializando tipos de tickets</span>
                <Loader className="w-4 h-4 animate-spin text-blue-400" />
              </div>
            </div>
          )}

          {status.stage === 'error' && (
            <div className="space-y-4 mb-6">
              <div className="glass-morphism rounded-xl p-4 text-left">
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span>Detalles del Error</span>
                </h4>
                {status.details?.errors ? (
                  <ul className="text-white/70 text-sm space-y-1">
                    {status.details.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/70 text-sm">{status.details?.error || 'Error desconocido'}</p>
                )}
              </div>
              
              {status.canRetry && (
                <button
                  onClick={handleRetry}
                  className="glass-button w-full px-6 py-3 rounded-xl text-white font-medium bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          )}

          {status.stage === 'complete' && (
            <div className="glass-morphism rounded-xl p-4 mb-6">
              <p className="text-green-400 text-sm">
                ✓ Sistema configurado correctamente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatabaseInitializer