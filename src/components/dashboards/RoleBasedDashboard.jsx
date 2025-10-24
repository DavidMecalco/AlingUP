import { useAuth } from '../../contexts/AuthContext'
import ClientDashboard from './ClientDashboard'
import TechnicianDashboard from './TechnicianDashboard'
import AdminDashboard from './AdminDashboard'

/**
 * Role-based dashboard component that renders the appropriate dashboard
 * based on the user's role and provides navigation
 * @returns {JSX.Element}
 */
const RoleBasedDashboard = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Cargando Dashboard</h3>
          <p className="text-white/70">Preparando tu espacio de trabajo...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="glass-card p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h2>
            <p className="text-white/70">Debes iniciar sesión para acceder al dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  const renderDashboardByRole = () => {
    const userRole = user?.profile?.rol || user?.rol

    switch (userRole) {
      case 'cliente':
        return <ClientDashboard />
      
      case 'tecnico':
        return <TechnicianDashboard />
      
      case 'admin':
        return <AdminDashboard />
      
      default:
        return (
          <div className="p-6">
            <div className="glass-card animate-slide-in">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-white">Rol No Reconocido</h3>
              </div>
              <p className="text-white/80">
                Tu rol ({userRole || 'desconocido'}) no está configurado para acceder al dashboard.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Content */}
        <div className="pb-6">
          {renderDashboardByRole()}
        </div>
      </div>
    </div>
  )
}

export default RoleBasedDashboard