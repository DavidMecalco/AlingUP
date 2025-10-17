import { useAuth as useAuthContext } from '../contexts/AuthContext'

/**
 * Custom hook for authentication operations
 * Re-exports the useAuth hook from AuthContext for better organization
 */
export const useAuth = () => {
  return useAuthContext()
}

export default useAuth