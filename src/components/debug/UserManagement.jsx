import { useState, useEffect } from 'react'
import { createTestUsers, checkTestUsers, getAllUsers } from '../../utils/createTestUsers'
import { createSampleTickets, checkSampleTickets } from '../../utils/createSampleTickets'
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Loader,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Ticket
} from 'lucide-react'

const UserManagement = () => {
  const [status, setStatus] = useState({
    checking: false,
    creating: false,
    users: [],
    allUsers: [],
    message: '',
    error: null
  })
  const [ticketStatus, setTicketStatus] = useState({
    checking: false,
    creating: false,
    tickets: [],
    message: '',
    error: null
  })
  const [showAllUsers, setShowAllUsers] = useState(false)

  const checkUsers = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }))
    
    try {
      const result = await checkTestUsers()
      const allUsersResult = await getAllUsers()
      
      setStatus(prev => ({
        ...prev,
        checking: false,
        users: result.users || [],
        allUsers: allUsersResult.users || [],
        message: result.message,
        error: result.success ? null : result.error
      }))
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        checking: false,
        error: error.message
      }))
    }
  }

  const createUsers = async () => {
    setStatus(prev => ({ ...prev, creating: true, error: null }))
    
    try {
      const result = await createTestUsers()
      
      setStatus(prev => ({
        ...prev,
        creating: false,
        message: result.message,
        error: result.success ? null : result.error
      }))

      // Refresh the user list
      if (result.success) {
        await checkUsers()
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        creating: false,
        error: error.message
      }))
    }
  }

  const checkTickets = async () => {
    setTicketStatus(prev => ({ ...prev, checking: true, error: null }))
    
    try {
      const result = await checkSampleTickets()
      
      setTicketStatus(prev => ({
        ...prev,
        checking: false,
        tickets: result.tickets || [],
        message: result.message,
        error: result.success ? null : result.error
      }))
    } catch (error) {
      setTicketStatus(prev => ({
        ...prev,
        checking: false,
        error: error.message
      }))
    }
  }

  const createTickets = async () => {
    setTicketStatus(prev => ({ ...prev, creating: true, error: null }))
    
    try {
      const result = await createSampleTickets()
      
      setTicketStatus(prev => ({
        ...prev,
        creating: false,
        message: result.message,
        error: result.success ? null : result.error
      }))

      // Refresh the ticket list
      if (result.success) {
        await checkTickets()
      }
    } catch (error) {
      setTicketStatus(prev => ({
        ...prev,
        creating: false,
        error: error.message
      }))
    }
  }

  useEffect(() => {
    checkUsers()
    checkTickets()
  }, [])

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-400 bg-red-500/20'
      case 'tecnico':
        return 'text-blue-400 bg-blue-500/20'
      case 'cliente':
        return 'text-green-400 bg-green-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkUsers}
              disabled={status.checking}
              className="glass-button p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${status.checking ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="glass-button p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={showAllUsers ? 'Ocultar todos los usuarios' : 'Mostrar todos los usuarios'}
            >
              {showAllUsers ? (
                <EyeOff className="w-4 h-4 text-white/70" />
              ) : (
                <Eye className="w-4 h-4 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {status.message && (
          <div className="mb-4 p-3 glass-morphism rounded-lg">
            <p className="text-white/80 text-sm">{status.message}</p>
          </div>
        )}

        {status.error && (
          <div className="mb-4 p-3 glass-morphism bg-red-500/20 border-red-400/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{status.error}</p>
            </div>
          </div>
        )}

        {/* Create Test Users Button */}
        <button
          onClick={createUsers}
          disabled={status.creating || status.checking}
          className="glass-button w-full px-4 py-3 rounded-xl text-white font-medium bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {status.creating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Creando usuarios de prueba...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Crear Usuarios de Prueba</span>
            </>
          )}
        </button>
      </div>

      {/* Test Users */}
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Usuarios de Prueba</h3>
        
        {status.users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No se encontraron usuarios de prueba</p>
            <p className="text-white/40 text-sm mt-1">
              Haz clic en "Crear Usuarios de Prueba" para generar usuarios de ejemplo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {status.users.map((user, index) => (
              <div key={index} className="glass-morphism rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.nombre} {user.apellido}</p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                    {user.rol}
                  </span>
                  {user.activo ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Users (when expanded) */}
      {showAllUsers && (
        <div className="glass-morphism rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Todos los Usuarios ({status.allUsers.length})
          </h3>
          
          {status.allUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No hay usuarios en la base de datos</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {status.allUsers.map((user, index) => (
                <div key={index} className="glass-morphism rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 glass-morphism rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {user.nombre || 'Sin nombre'} {user.apellido || ''}
                      </p>
                      <p className="text-white/60 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                      {user.rol || 'sin rol'}
                    </span>
                    {user.activo ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sample Tickets */}
      <div className="glass-morphism rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Ticket className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Tickets de Ejemplo</h3>
          </div>
          <button
            onClick={checkTickets}
            disabled={ticketStatus.checking}
            className="glass-button p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Actualizar lista de tickets"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${ticketStatus.checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {ticketStatus.message && (
          <div className="mb-4 p-3 glass-morphism rounded-lg">
            <p className="text-white/80 text-sm">{ticketStatus.message}</p>
          </div>
        )}

        {ticketStatus.error && (
          <div className="mb-4 p-3 glass-morphism bg-red-500/20 border-red-400/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{ticketStatus.error}</p>
            </div>
          </div>
        )}

        <button
          onClick={createTickets}
          disabled={ticketStatus.creating || ticketStatus.checking}
          className="glass-button w-full px-4 py-3 rounded-xl text-white font-medium bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
        >
          {ticketStatus.creating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Creando tickets de ejemplo...</span>
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              <span>Crear Tickets de Ejemplo</span>
            </>
          )}
        </button>

        {ticketStatus.tickets.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/70 text-sm mb-3">
              Tickets encontrados: {ticketStatus.tickets.length}
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {ticketStatus.tickets.slice(0, 5).map((ticket, index) => (
                <div key={index} className="glass-morphism rounded-lg p-2 flex items-center justify-between">
                  <span className="text-white/80 text-sm truncate">{ticket.titulo}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.prioridad === 'urgente' ? 'bg-red-500/20 text-red-300' :
                      ticket.prioridad === 'alta' ? 'bg-orange-500/20 text-orange-300' :
                      ticket.prioridad === 'media' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {ticket.prioridad}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.estado === 'abierto' ? 'bg-green-500/20 text-green-300' :
                      ticket.estado === 'en_progreso' ? 'bg-blue-500/20 text-blue-300' :
                      ticket.estado === 'vobo' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-emerald-500/15 text-emerald-700'
                    }`}>
                      {ticket.estado}
                    </span>
                  </div>
                </div>
              ))}
              {ticketStatus.tickets.length > 5 && (
                <p className="text-white/50 text-xs text-center">
                  ... y {ticketStatus.tickets.length - 5} más
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Credentials Info */}
      <div className="glass-morphism rounded-xl p-6 border border-yellow-400/30 bg-yellow-500/10">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">Credenciales de Prueba</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div>
                <strong>Administrador:</strong> admin@test.com / admin123
              </div>
              <div>
                <strong>Técnico:</strong> tecnico@test.com / tecnico123
              </div>
              <div>
                <strong>Cliente:</strong> cliente@test.com / cliente123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement