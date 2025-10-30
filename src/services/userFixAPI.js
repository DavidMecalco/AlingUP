/**
 * API calls to fix user roles and create tickets
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Insert or update current user in users table with cliente role
 */
export async function ensureCurrentUserAsCliente(userId, userEmail) {
  try {
    console.log('👤 Ensuring current user exists as cliente...')

    // Try to insert/upsert the current user with cliente role
    const userData = {
      id: userId,
      email: userEmail,
      nombre_completo: userEmail.split('@')[0], // Use email prefix as name
      rol: 'cliente',
      estado: true  // boolean, not string
    }

    console.log('📝 Upserting user data:', userData)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(userData)
    })

    if (response.ok) {
      const user = await response.json()
      console.log('✅ User upserted successfully:', user)
      return {
        success: true,
        user: Array.isArray(user) ? user[0] : user,
        message: 'User created/updated as cliente'
      }
    } else {
      const error = await response.text()
      console.log('❌ User upsert failed:', error)
      return {
        success: false,
        error: `Failed to upsert user: ${error}`
      }
    }

  } catch (error) {
    console.error('Error ensuring current user as cliente:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Create ticket with current user as cliente (bypassing user creation)
 */
export async function createTicketWithCurrentUser(ticketData, userId, userEmail) {
  try {
    console.log('🎫 Creating ticket with current user as cliente...')

    // Step 1: Get ticket types
    const typesResponse = await fetch(`${SUPABASE_URL}/rest/v1/ticket_types?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!typesResponse.ok) {
      const error = await typesResponse.text()
      return {
        success: false,
        error: `Failed to get ticket types: ${error}`
      }
    }

    const ticketTypes = await typesResponse.json()
    if (!ticketTypes || ticketTypes.length === 0) {
      return {
        success: false,
        error: 'No ticket types available'
      }
    }

    // Step 2: Ensure current user exists as cliente
    const userResult = await ensureCurrentUserAsCliente(userId, userEmail)
    if (!userResult.success) {
      console.log('⚠️ Could not ensure user as cliente, trying direct ticket creation...')
    }

    // Step 3: Create ticket with current user ID
    const ticketPayload = {
      titulo: ticketData.titulo || 'Test Ticket',
      descripcion: ticketData.descripcion || 'Test Description',
      estado: 'abierto',
      prioridad: ticketData.prioridad || 'media',
      tipo_ticket_id: ticketTypes[0].id,
      cliente_id: userId  // Use current user ID directly
    }

    console.log('📝 Creating ticket with payload:', ticketPayload)

    const ticketResponse = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ticketPayload)
    })

    console.log('📊 Ticket response status:', ticketResponse.status)

    if (!ticketResponse.ok) {
      const error = await ticketResponse.text()
      console.error('❌ Ticket creation failed:', error)
      return {
        success: false,
        error: `Failed to create ticket: ${error}`
      }
    }

    const createdTicket = await ticketResponse.json()
    console.log('✅ Ticket created successfully:', createdTicket)

    return {
      success: true,
      data: Array.isArray(createdTicket) ? createdTicket[0] : createdTicket,
      message: 'Ticket created with current user!'
    }

  } catch (error) {
    console.error('❌ Ticket creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Disable RLS temporarily for testing (if possible)
 */
export async function tryDisableRLS() {
  try {
    console.log('🔓 Attempting to check RLS status...')

    // This might not work with REST API, but worth trying
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_rls_status`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (response.ok) {
      const result = await response.json()
      console.log('RLS status:', result)
      return {
        success: true,
        result: result
      }
    } else {
      const error = await response.text()
      console.log('RLS check failed:', error)
      return {
        success: false,
        error: error
      }
    }

  } catch (error) {
    console.error('Error checking RLS:', error)
    return {
      success: false,
      error: error.message
    }
  }
}