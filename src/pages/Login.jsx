import React from 'react'
import LoginForm from '../components/auth/LoginForm'
import { PublicOnlyRoute } from '../components/auth/ProtectedRoute'

const Login = () => {
  return (
    <PublicOnlyRoute>
      <LoginForm />
    </PublicOnlyRoute>
  )
}

export default Login