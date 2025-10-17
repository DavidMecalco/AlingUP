import { supabase } from './supabaseClient'
import securityService from './securityService.js'

/**
 * Authentication service for handling user authentication operations
 * Provides login, logout, password reset, and session management
 */
class AuthService {
  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} clientIdentifier - Client identifier for rate limiting (IP, device ID, etc.)
   * @returns {Promise<{user: Object, session: Object, error: Object|null}>}
   */
  async signIn(email, password, clientIdentifier = 'unknown') {
    try {
      // Apply rate limiting for authentication attempts
      const rateLimitResult = securityService.checkRateLimit('auth', clientIdentifier)
      if (!rateLimitResult.allowed) {
        securityService.logSecurityEvent('auth_rate_limit_exceeded', {
          email: securityService.sanitizeInput(email, 'email'),
          clientIdentifier,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        })
        
        return { 
          user: null, 
          session: null, 
          error: { 
            message: `Too many login attempts. Please try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds.` 
          }
        }
      }

      // Sanitize email input
      const sanitizedEmail = securityService.sanitizeInput(email, 'email')
      
      // Validate email format
      if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        securityService.logSecurityEvent('invalid_email_format', {
          email: sanitizedEmail,
          clientIdentifier
        })
        
        return {
          user: null,
          session: null,
          error: { message: 'Invalid email format' }
        }
      }

      // Check for suspicious activity
      securityService.checkSuspiciousActivity(clientIdentifier, 'login_attempt', {
        email: sanitizedEmail,
        timestamp: Date.now()
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      })

      if (error) {
        // Log failed authentication attempt
        securityService.logSecurityEvent('auth_failed', {
          email: sanitizedEmail,
          clientIdentifier,
          error: error.message,
          timestamp: Date.now()
        })
        
        return { user: null, session: null, error }
      }

      // Log successful authentication
      securityService.logSecurityEvent('auth_success', {
        userId: data.user.id,
        email: sanitizedEmail,
        clientIdentifier,
        timestamp: Date.now()
      })

      // Get user profile data with role information
      const userProfile = await this.getUserProfile(data.user.id)
      
      return {
        user: data.user,
        session: data.session,
        profile: userProfile,
        error: null
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        user: null,
        session: null,
        error: { message: 'Error inesperado durante el inicio de sesión' }
      }
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<{error: Object|null}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: { message: 'Error al cerrar sesión' } }
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} clientIdentifier - Client identifier for rate limiting
   * @returns {Promise<{error: Object|null}>}
   */
  async resetPassword(email, clientIdentifier = 'unknown') {
    try {
      // Apply rate limiting for password reset attempts
      const rateLimitResult = securityService.checkRateLimit('auth', clientIdentifier)
      if (!rateLimitResult.allowed) {
        return { 
          error: { 
            message: `Too many password reset attempts. Please try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds.` 
          }
        }
      }

      // Sanitize and validate email
      const sanitizedEmail = securityService.sanitizeInput(email, 'email')
      if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        return { error: { message: 'Invalid email format' } }
      }

      // Check for suspicious activity
      securityService.checkSuspiciousActivity(clientIdentifier, 'password_reset', {
        email: sanitizedEmail,
        timestamp: Date.now()
      })

      const { error } = await supabase.auth.resetPasswordForEmail(
        sanitizedEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) {
        securityService.logSecurityEvent('password_reset_failed', {
          email: sanitizedEmail,
          clientIdentifier,
          error: error.message
        })
        return { error }
      }

      securityService.logSecurityEvent('password_reset_requested', {
        email: sanitizedEmail,
        clientIdentifier,
        timestamp: Date.now()
      })

      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: { message: 'Error al enviar email de recuperación' } }
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<{error: Object|null}>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: { message: 'Error al actualizar contraseña' } }
    }
  }

  /**
   * Get current session
   * @returns {Promise<{session: Object|null, error: Object|null}>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error }
      }

      return { session, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error: { message: 'Error al obtener sesión' } }
    }
  }

  /**
   * Get current user
   * @returns {Promise<{user: Object|null, error: Object|null}>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error }
      }

      if (user) {
        // Get user profile data
        const userProfile = await this.getUserProfile(user.id)
        return { 
          user: { ...user, profile: userProfile }, 
          error: null 
        }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: { message: 'Error al obtener usuario actual' } }
    }
  }

  /**
   * Get user profile from database
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Get user profile error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  /**
   * Refresh current session
   * @returns {Promise<{session: Object|null, error: Object|null}>}
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        return { session: null, error }
      }

      return { session: data.session, error: null }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { session: null, error: { message: 'Error al refrescar sesión' } }
    }
  }

  /**
   * Set up auth state change listener
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        let user = null
        
        if (session?.user) {
          // Get user profile when session is available
          const userProfile = await this.getUserProfile(session.user.id)
          user = { ...session.user, profile: userProfile }
        }

        callback(event, session, user)
      }
    )

    // Return unsubscribe function
    return () => {
      subscription?.unsubscribe()
    }
  }

  /**
   * Check if user has specific role
   * @param {Object} user - User object
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  hasRole(user, role) {
    return user?.profile?.rol === role
  }

  /**
   * Check if user is authenticated
   * @param {Object} session - Session object
   * @returns {boolean}
   */
  isAuthenticated(session) {
    return !!session?.access_token && !this.isSessionExpired(session)
  }

  /**
   * Check if session is expired
   * @param {Object} session - Session object
   * @returns {boolean}
   */
  isSessionExpired(session) {
    if (!session?.expires_at) return true
    
    const expirationTime = session.expires_at * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
    
    return currentTime >= (expirationTime - bufferTime)
  }

  /**
   * Get user role from session or user object
   * @param {Object} user - User object
   * @returns {string|null}
   */
  getUserRole(user) {
    return user?.profile?.rol || null
  }

  /**
   * Check if user can access resource based on role
   * @param {Object} user - User object
   * @param {string[]} allowedRoles - Array of allowed roles
   * @returns {boolean}
   */
  canAccess(user, allowedRoles) {
    const userRole = this.getUserRole(user)
    return userRole && allowedRoles.includes(userRole)
  }
}

// Create and export singleton instance
const authService = new AuthService()
export default authService