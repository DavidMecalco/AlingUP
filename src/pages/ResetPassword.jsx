import React from 'react'
import PasswordReset from '../components/auth/PasswordReset'
import { PublicOnlyRoute } from '../components/auth/ProtectedRoute'

const ResetPassword = () => {
  return (
    <PublicOnlyRoute>
      <PasswordReset />
    </PublicOnlyRoute>
  )
}

export default ResetPassword