import React from 'react'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import RoleBasedDashboard from '../components/dashboards/RoleBasedDashboard'

const Dashboard = () => {
  return (
    <AuthenticatedRoute>
      <RoleBasedDashboard />
    </AuthenticatedRoute>
  )
}

export default Dashboard