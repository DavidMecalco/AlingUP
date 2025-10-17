import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isValidEmail } from '../../utils/helpers'

const PasswordReset = () => {
  const { resetPassword } = useAuth()
  
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [emailError, setEmailError] = useState('')

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    
    // Clear errors when user types
    if (error) setError(null)
    if (emailError) setEmailError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setError(null)
    setEmailError('')

    // Validate email
    if (!email.trim()) {
      setEmailError('El email es requerido')
      return
    }

    if (!isValidEmail(email)) {
      setEmailError('El formato del email no es válido')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await resetPassword(email)
      
      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(getErrorMessage(result.error))
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Error inesperado. Intenta más tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = (error) => {
    if (!error) return ''
    
    const errorMessages = {
      'User not found': 'No se encontró un usuario con este email',
      'Invalid email': 'Email inválido',
      'Too many requests': 'Demasiados intentos. Intenta más tarde',
      'Email rate limit exceeded': 'Límite de emails excedido. Intenta más tarde'
    }

    return errorMessages[error.message] || error.message || 'Error al enviar email de recuperación'
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Enviado
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Hemos enviado un enlace de recuperación a tu email
            </p>
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                Si no ves el email, revisa tu carpeta de spam.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Dirección de email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none block w-full px-3 py-2 border ${
                  emailError ? 'border-red-300' : 'border-gray-300'
                } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="tu@email.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isSubmitting}
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </div>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordReset