import React from 'react'
import { AuthenticatedRoute } from '../components/auth/ProtectedRoute'
import TicketDetail from '../components/tickets/TicketDetail'

const TicketDetailPage = () => {
  return (
    <AuthenticatedRoute>
      <TicketDetail />
    </AuthenticatedRoute>
  )
}

export default TicketDetailPage