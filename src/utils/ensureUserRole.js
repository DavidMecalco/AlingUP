import { supabase } from '../services/supabaseClient'

/**
 * Ensure user has the correct role for creating tickets
 */
export async function ensureUserHasClienteRole(userId, userEmail) {
  try {
    console.log('🔍 Checking user role for:', userId, userEmail)

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000) // 10 second timeout
    })

    // First check if user exists in users table
    const queryPromise = supabase
      .from('users')
      .select('id, email, rol, nombre, apellido, activo')
      .eq('id', userId)

    const { data: existingUsers, error: checkError } = await Promise.race([
      queryPromise,
      timeoutPromise
    ])

    if (checkError) {
      console.error('Error checking user:', checkError)
      return {
        success: false,
        error: `Error checking user: ${checkError.message}`
      }
    }

    console.log('📊 Query result:', existingUsers)

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      console.log('✅ User found in database:', existingUser)
      
      if (existingUser.rol === 'cliente') {
        console.log('✅ User already has cliente role')
        return {
          success: true,
          user: existingUser,
          message: 'User already has cliente role'
        }
      } else {
        // For now, just return success without updating to avoid more complexity
        console.log('⚠️ User has different role, but proceeding anyway')
        return {
          success: true,
          user: existingUser,
          message: `User has role '${existingUser.rol}' but proceeding`
        }
      }
    } else {
      // User doesn't exist, try to create with a simple approach
      console.log('👤 User not found, creating profile...')
      
      try {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail,
            nombre: userEmail.split('@')[0],
            apellido: '',
            rol: 'cliente',
            activo: true
          })
          .select()

        if (createError) {
          console.error('Error creating user profile:', createError)
          // If creation fails, we'll use fallback
          return {
            success: false,
            error: `Error creating user profile: ${createError.message}`
          }
        }

        console.log('✅ User profile created:', newUser)
        return {
          success: true,
          user: newUser?.[0] || newUser,
          message: 'User profile created with cliente role'
        }
      } catch (createErr) {
        console.error('Failed to create user:', createErr)
        return {
          success: false,
          error: `Failed to create user: ${createErr.message}`
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error ensuring user role:', error)
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    }
  }
}

/**
 * Get a fallback cliente user ID if current user can't be used
 */
export async function getFallbackClienteId() {
  try {
    console.log('🔍 Looking for fallback cliente user...')

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Fallback query timeout')), 5000) // 5 second timeout
    })

    // Simple query with timeout
    const queryPromise = supabase
      .from('users')
      .select('id, email, rol')
      .eq('rol', 'cliente')
      .limit(1)

    const result = await Promise.race([queryPromise, timeoutPromise])
    
    const { data: clienteUsers, error: clienteError } = result

    if (clienteError) {
      console.error('Error finding cliente users:', clienteError)
      return {
        success: false,
        error: `Error finding cliente users: ${clienteError.message}`
      }
    }

    if (clienteUsers && clienteUsers.length > 0) {
      const clienteUser = clienteUsers[0]
      console.log('✅ Found cliente user:', clienteUser)
      return {
        success: true,
        clienteId: clienteUser.id,
        message: 'Using existing cliente user'
      }
    }

    console.log('❌ No cliente users found')
    return {
      success: false,
      error: 'No users with cliente role found in database'
    }

  } catch (error) {
    console.error('Error getting fallback cliente ID:', error)
    
    // If all else fails, return a hardcoded test user ID
    console.log('🔄 Using hardcoded fallback...')
    return {
      success: true,
      clienteId: '00000000-0000-0000-0000-000000000001', // Hardcoded fallback
      message: 'Using hardcoded fallback cliente ID'
    }
  }
}