import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * ProtectedRoute component for role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect to if access is denied (default: '/login')
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user, canAccess } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Cargando...</span>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !canAccess(allowedRoles)) {
    // Redirect to appropriate dashboard based on user role
    const userRole = user?.profile?.rol
    let dashboardPath = '/dashboard'

    switch (userRole) {
      case 'cliente':
        dashboardPath = '/dashboard/client'
        break
      case 'tecnico':
        dashboardPath = '/dashboard/technician'
        break
      case 'admin':
        dashboardPath = '/dashboard/admin'
        break
      default:
        dashboardPath = '/dashboard'
    }

    return <Navigate to={dashboardPath} replace />
  }

  // Render children if all checks pass
  return children
}

/**
 * Higher-order component for protecting routes
 * @param {React.Component} Component - Component to protect
 * @param {string[]} allowedRoles - Array of roles allowed to access this component
 * @param {string} redirectTo - Path to redirect to if access is denied
 */
export const withProtectedRoute = (Component, allowedRoles = [], redirectTo = '/login') => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Component for routes that should only be accessible when NOT authenticated
 * (e.g., login, register pages)
 */
export const PublicOnlyRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Cargando...</span>
        </div>
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Render children if not authenticated
  return children
}

/**
 * Role-specific route components for convenience
 */
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
)

export const TechnicianRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['tecnico', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
)

export const ClientRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['cliente', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
)

export const AuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={['cliente', 'tecnico', 'admin']} {...props}>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute