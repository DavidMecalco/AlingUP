import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { ensureTicketTypesExist } from '../../utils/seedTicketTypes'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader,
  RefreshCw
} from 'lucide-react'

const DatabaseStatus = ({ onStatusChange }) => {
  const [status, setStatus] = useState({
    connection: 'checking',
    ticketTypes: 'checking',
    message: 'Verificando conexión...'
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkDatabaseStatus = async () => {
    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('ticket_types')
        .select('count')
        .limit(1)

      if (connectionError) {
        setStatus({
          connection: 'error',
          ticketTypes: 'error',
          message: `Error de conexión: ${connectionError.message}`
        })
        onStatusChange?.(false)
        return
      }

      // Connection is good, now check ticket types
      setStatus(prev => ({
        ...prev,
        connection: 'success',
        message: 'Verificando tipos de tickets...'
      }))

      // Ensure ticket types exist
      const seedResult = await ensureTicketTypesExist()
      
      if (seedResult.success) {
        setStatus({
          connection: 'success',
          ticketTypes: 'success',
          message: seedResult.message
        })
        onStatusChange?.(true)
      } else {
        setStatus({
          connection: 'success',
          ticketTypes: 'error',
          message: seedResult.message
        })
        onStatusChange?.(false)
      }

    } catch (error) {
      console.error('Database status check error:', error)
      setStatus({
        connection: 'error',
        ticketTypes: 'error',
        message: `Error inesperado: ${error.message}`
      })
      onStatusChange?.(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setStatus({
      connection: 'checking',
      ticketTypes: 'checking',
      message: 'Verificando conexión...'
    })
    
    await checkDatabaseStatus()
    setIsRefreshing(false)
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const getStatusIcon = (statusType) => {
    switch (status[statusType]) {
      case 'checking':
        return <Loader className="w-4 h-4 animate-spin text-blue-400" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = () => {
    if (status.connection === 'error' || status.ticketTypes === 'error') {
      return 'border-red-400/50 bg-red-500/10'
    }
    if (status.connection === 'success' && status.ticketTypes === 'success') {
      return 'border-green-400/50 bg-green-500/10'
    }
    return 'border-blue-400/50 bg-blue-500/10'
  }

  return (
    <div className={`glass-morphism rounded-xl p-4 border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-white">Estado de la Base de Datos</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="glass-button p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Actualizar estado"
        >
          <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon('connection')}
          <span className="text-sm text-white/80">Conexión a Supabase</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon('ticketTypes')}
          <span className="text-sm text-white/80">Tipos de Tickets</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/70">{status.message}</p>
      </div>
    </div>
  )
}

export default DatabaseStatus