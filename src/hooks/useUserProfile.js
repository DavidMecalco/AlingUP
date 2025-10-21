import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'

/**
 * Hook to manage user profile in the users table
 * Automatically creates profile if it doesn't exist
 */
export const useUserProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const createProfile = async (authUser) => {
    try {
      console.log('Creating user profile for:', authUser.id)
      
      const userData = {
        id: authUser.id,
        email: authUser.email,
        nombre_completo: authUser.user_metadata?.full_name || 
                        authUser.user_metadata?.name || 
                        authUser.email.split('@')[0],
        rol: 'cliente', // Default role
        estado: true
      }

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }

      console.log('Profile created successfully:', data)
      return data
    } catch (error) {
      console.error('Error in createProfile:', error)
      throw error
    }
  }

  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found, create profile
          console.log('Profile not found, creating...')
          const newProfile = await createProfile(user)
          return newProfile
        }
        throw error
      }

      console.log('Profile found:', data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    } catch (error) {
      console.error('Error refreshing profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      refreshProfile()
    } else {
      setProfile(null)
      setLoading(false)
      setError(null)
    }
  }, [user])

  return {
    profile,
    loading,
    error,
    refreshProfile,
    hasValidProfile: profile && profile.estado && ['cliente', 'admin'].includes(profile.rol)
  }
}