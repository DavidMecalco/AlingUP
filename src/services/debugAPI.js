/**
 * Debug API calls to inspect database structure
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Get the structure of the users table
 */
export async function inspectUsersTable() {
  try {
    console.log('🔍 Inspecting users table structure...')

    // Try to get any existing users to see the column structure
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        error: `Failed to inspect users table: ${error}`
      }
    }

    const users = await response.json()
    console.log('👥 Users table sample:', users)

    // Also try to get the table schema info
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })

    return {
      success: true,
      users: users,
      message: `Found ${users.length} users in table`,
      sampleUser: users.length > 0 ? users[0] : null
    }

  } catch (error) {
    console.error('Error inspecting users table:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Try to create a minimal user record
 */
export async function createMinimalUser() {
  try {
    console.log('👤 Creating minimal user...')

    const minimalUser = {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'minimal-test@example.com',
      nombre_completo: 'Minimal Test User',
      rol: 'cliente',
      estado: true
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(minimalUser)
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        error: `Failed to create minimal user: ${error}`
      }
    }

    const createdUser = await response.json()
    console.log('✅ Minimal user created:', createdUser)

    return {
      success: true,
      user: createdUser,
      message: 'Minimal user created successfully'
    }

  } catch (error) {
    console.error('Error creating minimal user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Try different user creation approaches
 */
export async function tryDifferentUserCreation() {
  try {
    console.log('🧪 Trying different user creation approaches...')

    const approaches = [
      // Approach 1: Only required fields
      {
        name: 'Only required fields',
        data: {
          id: '33333333-3333-3333-3333-333333333333',
          email: 'test1@example.com',
          rol: 'cliente'
        }
      },
      // Approach 2: With nombre_completo
      {
        name: 'With nombre_completo',
        data: {
          id: '44444444-4444-4444-4444-444444444444',
          email: 'test2@example.com',
          nombre_completo: 'Test User',
          rol: 'cliente'
        }
      },
      // Approach 3: With estado field
      {
        name: 'With estado field',
        data: {
          id: '55555555-5555-5555-5555-555555555555',
          email: 'test3@example.com',
          nombre_completo: 'Test User',
          rol: 'cliente',
          estado: true
        }
      }
    ]

    const results = []

    for (const approach of approaches) {
      try {
        console.log(`Trying approach: ${approach.name}`)
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(approach.data)
        })

        if (response.ok) {
          const user = await response.json()
          results.push({
            approach: approach.name,
            success: true,
            user: user
          })
          console.log(`✅ ${approach.name} worked!`, user)
          break // Stop on first success
        } else {
          const error = await response.text()
          results.push({
            approach: approach.name,
            success: false,
            error: error
          })
          console.log(`❌ ${approach.name} failed:`, error)
        }
      } catch (err) {
        results.push({
          approach: approach.name,
          success: false,
          error: err.message
        })
      }
    }

    return {
      success: results.some(r => r.success),
      results: results,
      message: `Tried ${approaches.length} approaches`
    }

  } catch (error) {
    console.error('Error trying different approaches:', error)
    return {
      success: false,
      error: error.message
    }
  }
}