import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout, ErrorBoundary, ToastContainer, LoadingSpinner } from './components/common'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Lazy load pages for code splitting
const Login = React.lazy(() => import('./pages/Login'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Tickets = React.lazy(() => import('./pages/Tickets'))
const CreateTicket = React.lazy(() => import('./pages/CreateTicket'))
const TicketDetailPage = React.lazy(() => import('./pages/TicketDetailPage'))
const KanbanPage = React.lazy(() => import('./pages/KanbanPage'))
const AdminSettings = React.lazy(() => import('./components/admin/AdminSettings'))
const AdminPage = React.lazy(() => import('./pages/AdminPage'))
const DebugPage = React.lazy(() => import('./pages/DebugPage'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Loading fallback component for lazy loaded routes
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Default route redirects to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Debug route (accessible without authentication) */}
                  <Route path="/debug" element={<DebugPage />} />
                  
                  {/* Protected application routes with layout */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/tickets" element={
                    <ProtectedRoute>
                      <Layout>
                        <Tickets />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/tickets/create" element={
                    <ProtectedRoute>
                      <Layout>
                        <CreateTicket />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/tickets/:ticketId" element={
                    <ProtectedRoute>
                      <Layout>
                        <TicketDetailPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/kanban" element={
                    <ProtectedRoute>
                      <Layout>
                        <KanbanPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Layout>
                        <AdminSettings />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              
              {/* Toast notifications */}
              <ToastContainer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
