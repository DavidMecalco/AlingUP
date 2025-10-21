import { useAuth } from '../../hooks/useAuth'
import ClientDashboard from './ClientDashboard'
import TechnicianDashboard from './TechnicianDashboard'
import AdminDashboard from './AdminDashboard'
import DashboardNavigation from './DashboardNavigation'

/**
 * Role-based dashboard component that renders the appropriate dashboard
 * based on the user's role and provides navigation
 * @returns {JSX.Element}
 */
const RoleBasedDashboard = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder al dashboard.</p>
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Rol No Reconocido</h3>
              <p className="text-yellow-600">
                Tu rol ({userRole || 'desconocido'}) no está configurado para acceder al dashboard.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <DashboardNavigation />

        {/* Dashboard Content */}
        <div className="pb-6">
          {renderDashboardByRole()}
        </div>
      </div>
    </div>
  )
}

export default RoleBasedDashboard