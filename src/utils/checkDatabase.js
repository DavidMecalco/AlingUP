import { supabase } from '../services/supabaseClient'

/**
 * Check database tables and their content
 */
export async function checkDatabase() {
  try {
    console.log('🔍 Checking database tables...')

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, rol, estado')
      .limit(5)

    console.log('👥 Users:', users, usersError)

    // Check ticket_types table
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .select('*')

    console.log('🎫 Ticket Types:', ticketTypes, typesError)

    // Check tickets table structure
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .limit(1)

    console.log('📋 Tickets (sample):', tickets, ticketsError)

    return {
      users: { data: users, error: usersError },
      ticketTypes: { data: ticketTypes, error: typesError },
      tickets: { data: tickets, error: ticketsError }
    }

  } catch (error) {
    console.error('❌ Database check error:', error)
    return { error: error.message }
  }
}

/**
 * Create a simple ticket without tipo_ticket_id
 */
export async function createSimpleTicket(titulo, descripcion, clienteId) {
  try {
    const ticketNumber = `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    const ticketData = {
      ticket_number: ticketNumber,
      titulo,
      descripcion: descripcion || '',
      prioridad: 'media',
      cliente_id: clienteId,
      estado: 'abierto',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📝 Creating simple ticket:', ticketData)

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error creating simple ticket:', error)
      return { success: false, error: error.message, details: error }
    }

    console.log('✅ Simple ticket created:', data)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return { success: false, error: error.message }
  }
}