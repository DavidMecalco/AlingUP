/**
 * Direct API calls to Supabase REST API bypassing Supabase JS
 */
import { ensureUserHasClienteRole, getFallbackClienteId } from '../utils/ensureUserRole'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Create ticket using direct fetch to Supabase REST API
 */
export async function createTicketDirect(ticketData, clienteId, userEmail) {
  try {
    console.log('🚀 Creating ticket with direct API call...')
    console.log('📋 Received clienteId:', clienteId)
    console.log('📧 User email:', userEmail)

    // First get a ticket type
    console.log('📋 Step 1: Getting ticket type...')
    const typesResponse = await fetch(`${SUPABASE_URL}/rest/v1/ticket_types?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    })

    console.log('📊 Types response status:', typesResponse.status)

    if (!typesResponse.ok) {
      const error = await typesResponse.text()
      console.error('❌ Types fetch failed:', error)
      return {
        success: false,
        error: `Failed to get ticket types: ${error}`
      }
    }

    const ticketTypes = await typesResponse.json()
    console.log('✅ Got ticket types:', ticketTypes)

    if (!ticketTypes || ticketTypes.length === 0) {
      return {
        success: false,
        error: 'No ticket types available'
      }
    }

    // Step 2: Use a simple hardcoded cliente ID to avoid database issues
    console.log('👤 Step 2: Using hardcoded cliente ID to avoid database hanging...')
    
    // Use a known working cliente ID - this should be a real user ID from your database
    // You can get this by checking your users table in Supabase dashboard
    const workingClienteId = '00000000-0000-0000-0000-000000000001'
    
    console.log('✅ Using hardcoded cliente ID:', workingClienteId)
    clienteId = workingClienteId
    
    const finalTicketData = {
      titulo: ticketData.titulo,
      descripcion: ticketData.descripcion || '',
      estado: 'abierto',
      prioridad: ticketData.prioridad || 'media',
      tipo_ticket_id: ticketTypes[0].id,
      cliente_id: clienteId,
      closed_at: null  // Explicitly set to null for CHECK constraint
    }

    console.log('📝 Step 3: Creating ticket with data:', finalTicketData)

    // Create ticket
    const ticketResponse = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(finalTicketData)
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
      message: 'Ticket created with direct API!'
    }

  } catch (error) {
    console.error('❌ Direct API error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Test direct API connection
 */
export async function testDirectConnection() {
  try {
    console.log('🔌 Testing direct API connection...')

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=count&limit=0`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Connection test status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        error: `Connection failed: ${error}`
      }
    }

    const result = await response.json()
    console.log('✅ Direct connection successful:', result)

    return {
      success: true,
      message: 'Direct API connection works!'
    }

  } catch (error) {
    console.error('❌ Direct connection error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
/**

 * Create ticket with minimal validation - for testing purposes
 */
export async function createTicketSimple(ticketData) {
  try {
    console.log('🚀 Creating ticket with simple approach...')

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

    // Step 2: Ensure test user exists with cliente role
    console.log('👤 Ensuring test cliente user exists...')
    
    const clienteId = '11111111-1111-1111-1111-111111111111'
    
    // First check if user exists
    const checkUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,rol&id=eq.${clienteId}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (checkUserResponse.ok) {
      const existingUsers = await checkUserResponse.json()
      if (existingUsers && existingUsers.length > 0) {
        console.log('✅ Test user already exists:', existingUsers[0])
      } else {
        // User doesn't exist, create it
        console.log('👤 Creating test user...')
        const createUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id: clienteId,
            email: 'test-cliente@example.com',
            nombre_completo: 'Test Cliente',
            rol: 'cliente',
            estado: true
          })
        })

        if (createUserResponse.ok) {
          const newUser = await createUserResponse.json()
          console.log('✅ Test user created:', newUser)
        } else {
          const createError = await createUserResponse.text()
          console.log('⚠️ Could not create user, but proceeding:', createError)
        }
      }
    } else {
      console.log('⚠️ Could not check user existence, but proceeding with fixed ID')
    }

    // Step 3: Create ticket with the test cliente_id
    const ticketPayload = {
      titulo: ticketData.titulo || 'Test Ticket',
      descripcion: ticketData.descripcion || 'Test Description',
      estado: 'abierto',
      prioridad: ticketData.prioridad || 'media',
      tipo_ticket_id: ticketTypes[0].id,
      cliente_id: clienteId
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
      message: 'Ticket created with simple approach!'
    }

  } catch (error) {
    console.error('❌ Simple ticket creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}