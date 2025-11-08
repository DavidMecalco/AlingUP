import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTicketStats } from '../../hooks/useTicketStats'
import TicketList from './TicketList'
import GlassCard from '../common/GlassCard'
import { 
  Plus, 
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  Sparkles,
  Target
} from 'lucide-react'
import '../../styles/glass.css'

const MyTicketsSection = ({ filters, showClient, showTechnician }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { total, pendientes, resueltos, loading: statsLoading, error: statsError, refresh } = useTicketStats()

  const isClient = user?.profile?.rol === 'cliente'

  return (
    <div className="space-y-8">
      {/* Personalized Header for Clients */}
      {isClient && (
        <GlassCard className="animate-slide-in relative overflow-hidden glass-strong">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 glass-morphism rounded-3xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    ¡Hola, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}! 👋
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Aquí puedes ver el estado de todas tus solicitudes de soporte técnico
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/tickets/create')}
                className="glass-button px-8 py-4 rounded-2xl text-gray-900 font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200/50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Ticket</span>
              </button>
            </div>

            {/* Quick Actions for Clients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <button
                onClick={() => navigate('/tickets/create')}
                className="glass-morphism rounded-2xl p-4 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Crear Ticket</p>
                    <p className="text-sm text-gray-600">Nueva solicitud</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = 'mailto:soporte@alingup.com'}
                className="glass-morphism rounded-2xl p-4 text-left bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Contacto Directo</p>
                    <p className="text-sm text-gray-600">Soporte urgente</p>
                  </div>
                </div>
              </button>

              <button
                onClick={refresh}
                disabled={statsLoading}
                className="glass-morphism rounded-2xl p-4 text-left bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/30 hover:border-amber-300/50 transition-all duration-300 group disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <RefreshCw className={`w-5 h-5 text-amber-600 ${statsLoading ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Actualizar</p>
                    <p className="text-sm text-gray-600">Datos recientes</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Enhanced Stats Section */}
      <GlassCard className="animate-slide-up glass-strong" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isClient ? 'Resumen de Mis Tickets' : 'Estadísticas de Tickets'}
              </h3>
              <p className="text-gray-600">
                {statsLoading ? 'Actualizando datos...' : 'Información actualizada en tiempo real'}
              </p>
            </div>
          </div>
          
          {statsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              <p className="text-red-600 text-sm font-medium">Error: {statsError}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Ticket className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
              ) : (
                total
              )}
            </div>
            <p className="text-gray-900 font-semibold mb-1">Total</p>
            <p className="text-gray-600 text-sm">
              {isClient ? 'Tickets creados' : 'Todos los tickets'}
            </p>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/30 hover:border-amber-300/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
              ) : (
                pendientes
              )}
            </div>
            <p className="text-gray-900 font-semibold mb-1">Pendientes</p>
            <p className="text-gray-600 text-sm">En proceso</p>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6 text-center bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
              ) : (
                resueltos
              )}
            </div>
            <p className="text-gray-900 font-semibold mb-1">Resueltos</p>
            <p className="text-gray-600 text-sm">Completados</p>
          </div>
        </div>

        {/* Progress Bar for Clients */}
        {isClient && total > 0 && (
          <div className="mt-8 p-6 glass-morphism rounded-2xl bg-gradient-to-r from-gray-50/50 to-blue-50/30 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Progreso General</h4>
              <span className="text-sm font-medium text-gray-700">
                {Math.round((resueltos / total) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(resueltos / total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {resueltos} de {total} tickets han sido resueltos exitosamente
            </p>
          </div>
        )}
      </GlassCard>

      {/* Tickets List */}
      <GlassCard className="animate-slide-up glass-strong" style={{animationDelay: '0.2s'}}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isClient ? 'Mis Tickets' : 'Lista de Tickets'}
              </h3>
              <p className="text-gray-600">
                {isClient 
                  ? 'Todas tus solicitudes de soporte técnico'
                  : 'Gestiona todos los tickets del sistema'
                }
              </p>
            </div>
          </div>
        </div>

        <TicketList
          filters={filters}
          showClient={showClient}
          showTechnician={showTechnician}
          emptyMessage={
            isClient 
              ? "No tienes tickets creados"
              : "No se encontraron tickets"
          }
          emptyDescription={
            isClient
              ? "Crea tu primer ticket para solicitar asistencia técnica"
              : "Los tickets aparecerán aquí cuando se creen"
          }
        />
      </GlassCard>
    </div>
  )
}

export default MyTicketsSection