import { useState, useEffect } from 'react'
import GlassCard from '../common/GlassCard'
import { Ticket, CheckCircle, AlertTriangle, Clock, TrendingUp, RefreshCw } from 'lucide-react'

/**
 * Simplified Admin Dashboard for demo purposes
 */
const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('Loading DEMO dashboard data...')

      // Use mock data for demo (skip real API calls)
      setKpis({
        totalTickets: 2847,
        openTickets: 127,
        closedTickets: 2720,
        urgentTickets: 23,
        avgResolutionTime: 4.2
      })

      console.log('DEMO Dashboard data loaded successfully')
    } catch (error) {
      console.error('Error in demo mode:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
          <p className="text-white/70">Resumen general del sistema de tickets</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="glass-button px-4 py-2 rounded-xl text-white/80 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tickets */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Total de Tickets</p>
              <p className="text-3xl font-bold text-white mt-1">
                {kpis?.totalTickets || 0}
              </p>
              <p className="text-white/60 text-xs mt-1">Todos los tickets</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        {/* Open Tickets */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Abiertos</p>
              <p className="text-3xl font-bold text-white mt-1">
                {kpis?.openTickets || 0}
              </p>
              <p className="text-white/60 text-xs mt-1">Pendientes de resolución</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </GlassCard>

        {/* Closed Tickets */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Cerrados</p>
              <p className="text-3xl font-bold text-white mt-1">
                {kpis?.closedTickets || 0}
              </p>
              <p className="text-white/60 text-xs mt-1">Resueltos exitosamente</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        {/* Urgent Tickets */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Tickets Urgentes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {kpis?.urgentTickets || 0}
              </p>
              <p className="text-white/60 text-xs mt-1">Requieren atención inmediata</p>
            </div>
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Tickets por Estado */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tickets por Estado</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart CSS */}
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #10B981 0deg 295deg,
                  #F59E0B 295deg 340deg,
                  #EF4444 340deg 360deg
                )`
              }}>
                <div className="absolute inset-4 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{kpis?.totalTickets || 0}</div>
                    <div className="text-xs text-white/70">Total</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-white/80">Cerrados (2720)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-xs text-white/80">Abiertos (127)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-xs text-white/80">Urgentes (23)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Bar Chart - Tickets por Prioridad */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tickets por Prioridad</h3>
          <div className="h-64 flex items-end justify-center space-x-4 px-4">
            {/* Baja */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 bg-gray-400 rounded-t-lg" style={{ height: '120px' }}></div>
              <div className="text-xs text-white/80 text-center">
                <div className="font-semibold">1205</div>
                <div>Baja</div>
              </div>
            </div>
            
            {/* Media */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 bg-blue-400 rounded-t-lg" style={{ height: '140px' }}></div>
              <div className="text-xs text-white/80 text-center">
                <div className="font-semibold">1389</div>
                <div>Media</div>
              </div>
            </div>
            
            {/* Alta */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 bg-orange-400 rounded-t-lg" style={{ height: '80px' }}></div>
              <div className="text-xs text-white/80 text-center">
                <div className="font-semibold">230</div>
                <div>Alta</div>
              </div>
            </div>
            
            {/* Urgente */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 bg-red-400 rounded-t-lg" style={{ height: '30px' }}></div>
              <div className="text-xs text-white/80 text-center">
                <div className="font-semibold">23</div>
                <div>Urgente</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Técnicos */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top 5 Técnicos</h3>
          <div className="space-y-3">
            {[
              { name: 'Ana Rodríguez', tickets: 89, color: 'bg-purple-400' },
              { name: 'Carlos Mendoza', tickets: 76, color: 'bg-blue-400' },
              { name: 'María González', tickets: 68, color: 'bg-green-400' },
              { name: 'Luis Herrera', tickets: 54, color: 'bg-orange-400' },
              { name: 'Sofia Vargas', tickets: 42, color: 'bg-pink-400' }
            ].map((tech, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white/90">{tech.name}</span>
                    <span className="text-sm font-semibold text-white">{tech.tickets}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`${tech.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(tech.tickets / 89) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Clientes */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Clientes</h3>
          <div className="space-y-3">
            {[
              { name: 'TechCorp Solutions', tickets: 156 },
              { name: 'Global Industries', tickets: 134 },
              { name: 'Digital Dynamics', tickets: 98 },
              { name: 'Innovation Labs', tickets: 87 },
              { name: 'Future Systems', tickets: 73 }
            ].map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 glass-morphism rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm text-white/90">{client.name}</div>
                    <div className="text-xs text-white/60">{client.tickets} tickets</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white">{client.tickets}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Line Chart - Evolución Semanal */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Evolución Semanal</h3>
          <div className="h-40 flex items-end justify-between px-2">
            {[45, 52, 38, 67, 43, 29, 56].map((value, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div 
                  className="w-6 bg-gradient-to-t from-purple-500 to-blue-400 rounded-t-sm transition-all duration-500"
                  style={{ height: `${(value / 67) * 120}px` }}
                ></div>
                <div className="text-xs text-white/60">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-white/70">
            <span>Esta semana: 382 tickets</span>
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400">+12%</span>
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default AdminDashboard