import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a simple client without extra configurations
export const supabaseSimple = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-simple'
    }
  }
})

/**
 * Test simple insert with minimal client
 */
export async function testSimpleInsert() {
  try {
    console.log('🧪 Testing with simplified Supabase client...')

    // Get a ticket type first
    const { data: ticketTypes, error: typesError } = await supabaseSimple
      .from('ticket_types')
      .select('id')
      .limit(1)

    if (typesError || !ticketTypes?.length) {
      return {
        success: false,
        error: 'No ticket types available'
      }
    }

    const ticketData = {
      titulo: 'Test Simple Client',
      descripcion: 'Testing with simplified client',
      estado: 'abierto',
      prioridad: 'media',
      cliente_id: '190406bb-9419-4dd9-bef0-494e1c58705e',
      tipo_ticket_id: ticketTypes[0].id
    }

    console.log('📝 Inserting with simple client:', ticketData)

    const { data, error } = await supabaseSimple
      .from('tickets')
      .insert(ticketData)
      .select('*')
      .single()

    console.log('📊 Simple client result:', { data, error })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      success: true,
      data: data,
      message: 'Ticket created with simple client!'
    }

  } catch (error) {
    console.error('❌ Simple client error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default supabaseSimple