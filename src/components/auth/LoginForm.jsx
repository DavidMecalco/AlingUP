import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { validateLoginForm } from '../../utils/validation'
import { Mail, Lock, Shield, Zap, Users } from 'lucide-react'
import AlingUPLogo from '../common/AlingUPLogo'
import '../../styles/glass.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isLoading, error, clearError, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
    setFormErrors({})
  }, [formData, error, clearError])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setFormErrors({})
    clearError()

    // Validate form
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signIn(formData.email, formData.password)
      
      if (result.success) {
        // Navigation will be handled by the useEffect above
        console.log('Login successful')
      } else {
        // Error will be handled by the auth context
        console.error('Login failed:', result.error)
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = (error) => {
    if (!error) return ''
    
    // Map common Supabase auth errors to Spanish
    const errorMessages = {
      'Invalid login credentials': 'Credenciales de acceso inválidas',
      'Email not confirmed': 'Email no confirmado',
      'Too many requests': 'Demasiados intentos. Intenta más tarde',
      'User not found': 'Usuario no encontrado',
      'Invalid email': 'Email inválido',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres'
    }

    return errorMessages[error.message] || error.message || 'Error de autenticación'
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Floating Glass Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 text-white">
            <div className="space-y-6">
              <AlingUPLogo size="xl" variant="light" animated className="mb-8" />
              <h1 className="text-5xl font-bold leading-tight">
                Gestión de Tickets
                <span className="block text-3xl font-normal text-white/80 mt-2">
                  Nueva Generación
                </span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed">
                Experimenta la evolución en gestión de tickets con tecnología de vanguardia
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="glass-morphism rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass-morphism rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Velocidad Extrema</h3>
                    <p className="text-white/70">Procesamiento instantáneo de tickets</p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass-morphism rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Seguridad Avanzada</h3>
                    <p className="text-white/70">Protección de datos de nivel empresarial</p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass-morphism rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Colaboración Fluida</h3>
                    <p className="text-white/70">Trabajo en equipo sin fricciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <AlingUPLogo size="lg" variant="light" animated />
            </div>

            {/* Glass Login Card */}
            <div className="glass-card p-8 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Bienvenido
                </h2>
                <p className="text-white/70">
                  Accede a tu espacio de trabajo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white/90">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 ${
                        formErrors.email ? 'ring-2 ring-red-400/50' : ''
                      }`}
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white/90">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 ${
                        formErrors.password ? 'ring-2 ring-red-400/50' : ''
                      }`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                  {formErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="glass-morphism bg-red-500/20 border-red-400/30 rounded-2xl p-4 animate-slide-in">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-red-400 font-medium text-sm">Error de autenticación</h4>
                        <p className="text-red-300 text-sm">{getErrorMessage(error)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="glass-button w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 hover:to-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                >
                  {(isLoading || isSubmitting) ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <span>Iniciar Sesión</span>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline"
                    onClick={() => navigate('/reset-password')}
                    disabled={isLoading || isSubmitting}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm