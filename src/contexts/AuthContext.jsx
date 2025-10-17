import React, { createContext, useContext, useReducer, useEffect } from 'react'
import authService from '../services/authService'

// Initial state
const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_SESSION: 'SET_SESSION',
  SET_ERROR: 'SET_ERROR',
  SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
  SIGN_OUT: 'SIGN_OUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      }

    case AUTH_ACTIONS.SET_SESSION:
      return {
        ...state,
        session: action.payload,
        isAuthenticated: authService.isAuthenticated(action.payload),
        isLoading: false
      }

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case AUTH_ACTIONS.SIGN_IN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...initialState,
        isLoading: false
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext(null)

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state on mount
  useEffect(() => {
    let unsubscribe = null

    const initializeAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

        // Get current session
        const { session, error } = await authService.getSession()
        
        if (error) {
          console.error('Session error:', error)
          dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
          return
        }

        if (session) {
          // Get current user with profile
          const { user, error: userError } = await authService.getCurrentUser()
          
          if (userError) {
            console.error('User error:', userError)
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: userError })
            return
          }

          dispatch({
            type: AUTH_ACTIONS.SIGN_IN_SUCCESS,
            payload: { user, session }
          })
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }

        // Set up auth state change listener
        unsubscribe = authService.onAuthStateChange(async (event, session, user) => {
          console.log('Auth state change:', event, session?.user?.email)

          switch (event) {
            case 'SIGNED_IN':
              dispatch({
                type: AUTH_ACTIONS.SIGN_IN_SUCCESS,
                payload: { user, session }
              })
              break

            case 'SIGNED_OUT':
              dispatch({ type: AUTH_ACTIONS.SIGN_OUT })
              break

            case 'TOKEN_REFRESHED':
              dispatch({
                type: AUTH_ACTIONS.SET_SESSION,
                payload: session
              })
              if (user) {
                dispatch({
                  type: AUTH_ACTIONS.SET_USER,
                  payload: user
                })
              }
              break

            case 'USER_UPDATED':
              if (user) {
                dispatch({
                  type: AUTH_ACTIONS.SET_USER,
                  payload: user
                })
              }
              break

            default:
              break
          }
        })

      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: { message: 'Error al inicializar autenticación' }
        })
      }
    }

    initializeAuth()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Sign in function
  const signIn = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

      const { user, session, profile, error } = await authService.signIn(email, password)

      if (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
        return { success: false, error }
      }

      // The auth state change listener will handle the state update
      return { success: true, user: { ...user, profile }, session }

    } catch (error) {
      console.error('Sign in error:', error)
      const errorMessage = { message: 'Error inesperado durante el inicio de sesión' }
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      const { error } = await authService.signOut()

      if (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
        return { success: false, error }
      }

      // The auth state change listener will handle the state update
      return { success: true }

    } catch (error) {
      console.error('Sign out error:', error)
      const errorMessage = { message: 'Error al cerrar sesión' }
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

      const { error } = await authService.resetPassword(email)

      if (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
        return { success: false, error }
      }

      return { success: true }

    } catch (error) {
      console.error('Reset password error:', error)
      const errorMessage = { message: 'Error al enviar email de recuperación' }
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

      const { error } = await authService.updatePassword(newPassword)

      if (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
        return { success: false, error }
      }

      return { success: true }

    } catch (error) {
      console.error('Update password error:', error)
      const errorMessage = { message: 'Error al actualizar contraseña' }
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Refresh session function
  const refreshSession = async () => {
    try {
      const { session, error } = await authService.refreshSession()

      if (error) {
        console.error('Refresh session error:', error)
        return { success: false, error }
      }

      return { success: true, session }

    } catch (error) {
      console.error('Refresh session error:', error)
      return { success: false, error: { message: 'Error al refrescar sesión' } }
    }
  }

  // Helper functions
  const hasRole = (role) => {
    return authService.hasRole(state.user, role)
  }

  const canAccess = (allowedRoles) => {
    return authService.canAccess(state.user, allowedRoles)
  }

  const getUserRole = () => {
    return authService.getUserRole(state.user)
  }

  // Context value
  const value = {
    // State
    user: state.user,
    session: state.session,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    refreshSession,

    // Helper functions
    hasRole,
    canAccess,
    getUserRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext