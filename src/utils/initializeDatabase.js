import { supabase } from '../services/supabaseClient'

/**
 * Check if the users table exists and has the required structure
 */
export async function checkUsersTable() {
  try {
    console.log('Checking users table...')
    
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, rol, estado')
      .limit(1)

    if (error) {
      console.error('Users table check error:', error)
      return {
        exists: false,
        error: error.message
      }
    }

    console.log('Users table exists and is accessible')
    return {
      exists: true,
      error: null
    }
  } catch (error) {
    console.error('Error checking users table:', error)
    return {
      exists: false,
      error: error.message
    }
  }
}

/**
 * Initialize the current user's profile if it doesn't exist
 */
export async function initializeCurrentUserProfile() {
  try {
    console.log('Initializing current user profile...')
    
    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('No authenticated user found:', authError)
      return {
        success: false,
        error: 'No hay usuario autenticado'
      }
    }

    console.log('Current user:', user.id, user.email)

    // Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError)
      return {
        success: false,
        error: `Error al verificar perfil: ${profileError.message}`
      }
    }

    if (existingProfile) {
      console.log('User profile already exists:', existingProfile)
      return {
        success: true,
        profile: existingProfile,
        created: false
      }
    }

    // Create user profile
    console.log('Creating user profile...')
    const userData = {
      id: user.id,
      email: user.email,
      nombre_completo: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email.split('@')[0],
      rol: 'cliente', // Default role
      estado: true
    }

    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return {
        success: false,
        error: `Error al crear perfil: ${insertError.message}`
      }
    }

    console.log('User profile created successfully:', newProfile)
    return {
      success: true,
      profile: newProfile,
      created: true
    }

  } catch (error) {
    console.error('Error initializing user profile:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Complete database initialization check
 */
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...')
    
    const results = {
      usersTable: await checkUsersTable(),
      userProfile: null
    }

    if (results.usersTable.exists) {
      results.userProfile = await initializeCurrentUserProfile()
    }

    console.log('Database initialization results:', results)
    return results

  } catch (error) {
    console.error('Error during database initialization:', error)
    return {
      usersTable: { exists: false, error: error.message },
      userProfile: { success: false, error: error.message }
    }
  }
}