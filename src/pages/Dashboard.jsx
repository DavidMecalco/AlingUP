import React from 'react'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user, signOut, isLoading, isAuthenticated } = useAuth()

  // Debug logs
  console.log('Dashboard - user:', user)
  console.log('Dashboard - isLoading:', isLoading)
  console.log('Dashboard - isAuthenticated:', isAuthenticated)

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Portal de Gestión de Tickets
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {user?.profile?.nombre_completo || user?.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {user?.profile?.rol || 'Usuario'}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Bienvenido al portal de gestión de tickets
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Información del Usuario
              </h3>
              <dl className="text-sm text-blue-700">
                <div className="flex justify-between py-1">
                  <dt>Email:</dt>
                  <dd>{user?.email}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt>Nombre:</dt>
                  <dd>{user?.profile?.nombre_completo || 'No disponible'}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt>Rol:</dt>
                  <dd className="capitalize">{user?.profile?.rol || 'No disponible'}</dd>
                </div>
                {user?.profile?.empresa_cliente && (
                  <div className="flex justify-between py-1">
                    <dt>Empresa:</dt>
                    <dd>{user.profile.empresa_cliente}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}

export default Dashboard