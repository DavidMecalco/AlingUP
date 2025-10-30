/**
 * API calls using authenticated Supabase client (bypasses RLS issues)
 */
import { supabase } from './supabaseClient'

/**
 * Create user profile using authenticated Supabase client
 */
export async function createUserProfileAuthenticated(userId, userEmail) {
  try {
    console.log('👤 Creating user profile with authenticated client...')

    const userData = {
      id: userId,
      email: userEmail,
      nombre_completo: userEmail.split('@')[0],
      rol: 'cliente',
      estado: true
    }

    console.log('📝 Creating user with data:', userData)

    // Use authenticated Supabase client instead of direct fetch
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('❌ User creation failed:', error)
      return {
        success: false,
        error: `Failed to create user: ${error.message}`
      }
    }

    console.log('✅ User created successfully:', data)
    return {
      success: true,
      user: Array.isArray(data) ? data[0] : data,
      message: 'User profile created successfully'
    }

  } catch (error) {
    console.error('Error creating user profile:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Create ticket using authenticated Supabase client
 */
export async function createTicketAuthenticated(ticketData, userId, userEmail) {
  try {
    console.log('🎫 Creating ticket with authenticated client...')

    // Step 1: Get ticket types
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .select('id')
      .limit(1)

    if (typesError) {
      console.error('❌ Failed to get ticket types:', typesError)
      return {
        success: false,
        error: `Failed to get ticket types: ${typesError.message}`
      }
    }

    if (!ticketTypes || ticketTypes.length === 0) {
      return {
        success: false,
        error: 'No ticket types available'
      }
    }

    // Step 2: Ensure user profile exists
    const userResult = await createUserProfileAuthenticated(userId, userEmail)
    if (!userResult.success) {
      console.log('⚠️ Could not create user profile, but proceeding with ticket creation...')
    } else {
      console.log('✅ User profile ensured:', userResult.message)
    }

    // Step 3: Create ticket
    const ticketPayload = {
      titulo: ticketData.titulo || 'Test Ticket',
      descripcion: ticketData.descripcion || 'Test Description',
      estado: 'abierto',
      prioridad: ticketData.prioridad || 'media',
      tipo_ticket_id: ticketTypes[0].id,
      cliente_id: userId
    }

    console.log('📝 Creating ticket with payload:', ticketPayload)

    const { data: createdTicket, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketPayload)
      .select()

    if (ticketError) {
      console.error('❌ Ticket creation failed:', ticketError)
      return {
        success: false,
        error: `Failed to create ticket: ${ticketError.message}`
      }
    }

    console.log('✅ Ticket created successfully:', createdTicket)
    return {
      success: true,
      data: Array.isArray(createdTicket) ? createdTicket[0] : createdTicket,
      message: 'Ticket created successfully with authenticated client!'
    }

  } catch (error) {
    console.error('❌ Authenticated ticket creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check current user session and permissions
 */
export async function checkUserSession() {
  try {
    console.log('🔍 Checking user session...')

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    if (!session) {
      return {
        success: false,
        error: 'No active session'
      }
    }

    console.log('✅ Active session found:', {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role
    })

    return {
      success: true,
      session: session,
      user: session.user,
      message: 'Active session found'
    }

  } catch (error) {
    console.error('Error checking session:', error)
    return {
      success: false,
      error: error.message
    }
  }
}