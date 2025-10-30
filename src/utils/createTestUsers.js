import { supabase } from '../services/supabaseClient'

/**
 * Create test users for development and testing
 */
export async function createTestUsers() {
  try {
    console.log('Creating test users...')

    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        nombre: 'Administrador',
        apellido: 'Sistema'
      },
      {
        email: 'tecnico@test.com',
        password: 'tecnico123',
        role: 'tecnico',
        nombre: 'Técnico',
        apellido: 'Soporte'
      },
      {
        email: 'cliente@test.com',
        password: 'cliente123',
        role: 'cliente',
        nombre: 'Cliente',
        apellido: 'Prueba'
      }
    ]

    const results = []

    for (const user of testUsers) {
      try {
        console.log(`Creating user: ${user.email}`)

        // First, try to sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              nombre: user.nombre,
              apellido: user.apellido,
              rol: user.role
            }
          }
        })

        if (authError) {
          // If user already exists, try to get their profile
          if (authError.message.includes('already registered')) {
            console.log(`User ${user.email} already exists, checking profile...`)
            
            // Try to get existing user profile
            const { data: existingUser, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('email', user.email)
              .single()

            if (profileError) {
              console.error(`Error getting profile for ${user.email}:`, profileError)
              results.push({
                email: user.email,
                success: false,
                error: `Profile not found: ${profileError.message}`,
                action: 'check_existing'
              })
            } else {
              console.log(`User ${user.email} profile found:`, existingUser)
              results.push({
                email: user.email,
                success: true,
                message: 'User already exists with profile',
                action: 'existing',
                profile: existingUser
              })
            }
          } else {
            console.error(`Auth error for ${user.email}:`, authError)
            results.push({
              email: user.email,
              success: false,
              error: authError.message,
              action: 'signup'
            })
          }
          continue
        }

        if (authData.user) {
          console.log(`User ${user.email} created successfully`)
          
          // Wait a bit for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Update the user profile with the correct role and info
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email: user.email,
              nombre: user.nombre,
              apellido: user.apellido,
              rol: user.role,
              activo: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()

          if (profileError) {
            console.error(`Profile creation error for ${user.email}:`, profileError)
            results.push({
              email: user.email,
              success: false,
              error: `Profile creation failed: ${profileError.message}`,
              action: 'profile_creation',
              authUser: authData.user
            })
          } else {
            console.log(`Profile created for ${user.email}:`, profileData)
            results.push({
              email: user.email,
              success: true,
              message: 'User and profile created successfully',
              action: 'created',
              authUser: authData.user,
              profile: profileData
            })
          }
        }

      } catch (error) {
        console.error(`Unexpected error creating user ${user.email}:`, error)
        results.push({
          email: user.email,
          success: false,
          error: error.message,
          action: 'unexpected_error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    console.log(`Test users creation completed: ${successCount}/${totalCount} successful`)

    return {
      success: successCount > 0,
      message: `Created/verified ${successCount}/${totalCount} test users`,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      }
    }

  } catch (error) {
    console.error('Error creating test users:', error)
    return {
      success: false,
      message: `Error creating test users: ${error.message}`,
      error: error.message
    }
  }
}

/**
 * Check if test users exist
 */
export async function checkTestUsers() {
  try {
    const testEmails = ['admin@test.com', 'tecnico@test.com', 'cliente@test.com']
    
    const { data: users, error } = await supabase
      .from('users')
      .select('email, rol, nombre, apellido, activo')
      .in('email', testEmails)

    if (error) {
      console.error('Error checking test users:', error)
      return {
        success: false,
        error: error.message,
        users: []
      }
    }

    return {
      success: true,
      users: users || [],
      count: users?.length || 0,
      message: `Found ${users?.length || 0} test users`
    }

  } catch (error) {
    console.error('Error checking test users:', error)
    return {
      success: false,
      error: error.message,
      users: []
    }
  }
}

/**
 * Get all users from database
 */
export async function getAllUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting all users:', error)
      return {
        success: false,
        error: error.message,
        users: []
      }
    }

    return {
      success: true,
      users: users || [],
      count: users?.length || 0,
      message: `Found ${users?.length || 0} users in database`
    }

  } catch (error) {
    console.error('Error getting all users:', error)
    return {
      success: false,
      error: error.message,
      users: []
    }
  }
}