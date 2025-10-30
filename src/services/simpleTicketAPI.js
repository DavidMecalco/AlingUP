/**
 * Ultra-simple ticket creation that bypasses all user validation
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Create ticket without any user validation - for testing only
 */
export async function createTicketNoValidation(ticketData) {
  try {
    console.log('🚀 Creating ticket without validation...')

    // Hardcoded values to avoid any database queries
    const hardcodedTicketTypeId = 'd169741b-66e8-4df1-ad87-93ad2b7b616c' // From previous logs
    const hardcodedClienteId = '190406bb-9419-4dd9-bef0-494e1c58705e' // Current user ID

    const ticketPayload = {
      titulo: ticketData.titulo || 'Test Ticket No Validation',
      descripcion: ticketData.descripcion || 'Created without any validation',
      estado: 'abierto',
      prioridad: ticketData.prioridad || 'media',
      tipo_ticket_id: hardcodedTicketTypeId,
      cliente_id: hardcodedClienteId
    }

    console.log('📝 Creating ticket with hardcoded values:', ticketPayload)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ticketPayload)
    })

    console.log('📊 Response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Ticket creation failed:', error)
      
      // If it fails, let's try to understand why
      if (error.includes('Cliente ID must reference a user with cliente role')) {
        return {
          success: false,
          error: 'Need to create user profile first. The user ID exists in auth but not in users table with cliente role.',
          suggestion: 'You need to manually insert a record in the users table via Supabase dashboard'
        }
      }
      
      return {
        success: false,
        error: `Failed to create ticket: ${error}`
      }
    }

    const createdTicket = await response.json()
    console.log('✅ Ticket created successfully:', createdTicket)

    return {
      success: true,
      data: Array.isArray(createdTicket) ? createdTicket[0] : createdTicket,
      message: 'Ticket created without validation!'
    }

  } catch (error) {
    console.error('❌ Error creating ticket:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Manual instructions for creating user via Supabase dashboard
 */
export function getManualUserCreationInstructions(userId, userEmail) {
  return {
    instructions: [
      '1. Go to Supabase Dashboard → Database → Tables → users',
      '2. Click "Insert" → "Insert row"',
      '3. Fill in the following values:',
      `   - id: ${userId}`,
      `   - email: ${userEmail}`,
      `   - nombre_completo: ${userEmail.split('@')[0]}`,
      '   - rol: cliente',
      '   - estado: true',
      '4. Click "Save"',
      '5. Then try creating the ticket again'
    ],
    values: {
      id: userId,
      email: userEmail,
      nombre_completo: userEmail.split('@')[0],
      rol: 'cliente',
      estado: true
    }
  }
}

/**
 * Test basic connectivity
 */
export async function testBasicConnectivity() {
  try {
    console.log('🔌 Testing basic connectivity...')

    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    console.log('📊 Connectivity test status:', response.status)

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Basic connectivity works' : 'Connectivity failed'
    }

  } catch (error) {
    console.error('❌ Connectivity test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}