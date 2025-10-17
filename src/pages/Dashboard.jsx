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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                  Bienvenido al portal de gestión de tickets
                </p>
                
                {/* Quick Actions */}
                {(user?.profile?.rol === 'cliente' || user?.profile?.rol === 'admin') && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Acciones Rápidas
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => window.location.href = '/tickets/create'}
                        className="btn-primary flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Crear Nuevo Ticket
                      </button>
                      <button
                        onClick={() => window.location.href = '/tickets'}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Ver Mis Tickets
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Activity Placeholder */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Actividad Reciente
                  </h3>
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p>No hay actividad reciente</p>
                    <p className="text-sm">Los tickets y actualizaciones aparecerán aquí</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Información del Usuario
                </h3>
                <dl className="text-sm space-y-3">
                  <div>
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="text-gray-900 font-medium">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Nombre:</dt>
                    <dd className="text-gray-900 font-medium">{user?.profile?.nombre_completo || 'No disponible'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Rol:</dt>
                    <dd>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                        {user?.profile?.rol || 'Usuario'}
                      </span>
                    </dd>
                  </div>
                  {user?.profile?.empresa_cliente && (
                    <div>
                      <dt className="text-gray-500">Empresa:</dt>
                      <dd className="text-gray-900 font-medium">{user.profile.empresa_cliente}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Help Card */}
              <div className="card mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  ¿Necesitas Ayuda?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Crear un ticket</p>
                      <p>Para reportar problemas o solicitar asistencia</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Seguimiento</p>
                      <p>Revisa el estado de tus tickets existentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  )
}

export default Dashboard