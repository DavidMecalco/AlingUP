import { supabase } from '../services/supabaseClient'

/**
 * Verify the tickets table structure and permissions
 */
export async function verifyTicketsTable() {
  try {
    console.log('🔍 Verifying tickets table...')

    // First, try to get table info using a simple query
    console.log('📊 Step 1: Testing basic SELECT...')
    const { data: selectTest, error: selectError } = await supabase
      .from('tickets')
      .select('*')
      .limit(0) // Get no rows, just test the query

    console.log('SELECT test result:', { selectTest, selectError })

    if (selectError) {
      return {
        exists: false,
        error: selectError.message,
        code: selectError.code
      }
    }

    // Try to get any existing tickets
    console.log('📊 Step 2: Checking existing tickets...')
    const { data: existingTickets, error: existingError } = await supabase
      .from('tickets')
      .select('*')
      .limit(5)

    console.log('Existing tickets:', { existingTickets, existingError })

    // Try to describe the table structure (this might not work in Supabase)
    console.log('📊 Step 3: Attempting to get table structure...')
    
    return {
      exists: true,
      canSelect: true,
      existingTickets: existingTickets || [],
      count: existingTickets?.length || 0,
      message: 'Table exists and is readable'
    }

  } catch (error) {
    console.error('❌ Table verification error:', error)
    return {
      exists: false,
      error: error.message
    }
  }
}

/**
 * Try to create a ticket using raw SQL
 */
export async function createTicketWithSQL() {
  try {
    console.log('🔧 Attempting to create ticket with raw SQL...')

    // Use Supabase RPC to execute raw SQL
    const { data, error } = await supabase.rpc('create_simple_ticket', {
      ticket_title: 'Test Ticket via SQL',
      ticket_description: 'Created via raw SQL'
    })

    console.log('SQL creation result:', { data, error })

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
      message: 'Ticket created via SQL'
    }

  } catch (error) {
    console.error('❌ SQL creation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check if the cliente_id exists in users table
 */
export async function verifyClienteId(clienteId) {
  try {
    console.log('🔍 Verifying cliente_id:', clienteId)

    // Check if the user exists in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, rol, estado')
      .eq('id', clienteId)
      .single()

    console.log('User lookup result:', { user, userError })

    if (userError) {
      return {
        exists: false,
        error: userError.message,
        code: userError.code
      }
    }

    if (!user) {
      return {
        exists: false,
        error: 'User not found'
      }
    }

    return {
      exists: true,
      user: user,
      message: `User found: ${user.email} (${user.rol})`
    }

  } catch (error) {
    console.error('❌ Cliente ID verification error:', error)
    return {
      exists: false,
      error: error.message
    }
  }
}

/**
 * Check if ticket types exist
 */
export async function checkTicketTypes() {
  try {
    console.log('🔍 Checking ticket types...')

    const { data: ticketTypes, error } = await supabase
      .from('ticket_types')
      .select('*')

    console.log('Ticket types result:', { ticketTypes, error })

    if (error) {
      return {
        exists: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      exists: true,
      types: ticketTypes || [],
      count: ticketTypes?.length || 0,
      message: `Found ${ticketTypes?.length || 0} ticket types`
    }

  } catch (error) {
    console.error('❌ Ticket types check error:', error)
    return {
      exists: false,
      error: error.message
    }
  }
}

/**
 * Try to create ticket with a valid tipo_ticket_id
 */
export async function createTicketWithValidType() {
  try {
    console.log('🔧 Attempting to create ticket with valid tipo_ticket_id...')

    // First get a ticket type
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .select('id, nombre')
      .limit(1)

    console.log('Available ticket types:', { ticketTypes, typesError })

    if (typesError || !ticketTypes || ticketTypes.length === 0) {
      return {
        success: false,
        error: 'No ticket types available',
        suggestion: 'Create ticket types first'
      }
    }

    const ticketData = {
      titulo: 'Test with valid type',
      descripcion: 'Testing with valid tipo_ticket_id',
      estado: 'abierto',
      prioridad: 'media',
      tipo_ticket_id: ticketTypes[0].id
    }

    console.log('📝 Inserting with tipo_ticket_id:', ticketData)

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select('*')
      .single()

    console.log('Insert result:', { data, error })

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
      message: 'Ticket created with valid tipo_ticket_id!'
    }

  } catch (error) {
    console.error('❌ Creation with valid type error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check what columns actually exist in the tickets table
 */
export async function getTableColumns() {
  try {
    console.log('🔍 Checking table columns...')

    // Try different column combinations to see what exists
    const tests = [
      { name: 'id', query: () => supabase.from('tickets').select('id').limit(0) },
      { name: 'titulo', query: () => supabase.from('tickets').select('titulo').limit(0) },
      { name: 'descripcion', query: () => supabase.from('tickets').select('descripcion').limit(0) },
      { name: 'estado', query: () => supabase.from('tickets').select('estado').limit(0) },
      { name: 'prioridad', query: () => supabase.from('tickets').select('prioridad').limit(0) },
      { name: 'cliente_id', query: () => supabase.from('tickets').select('cliente_id').limit(0) },
      { name: 'created_at', query: () => supabase.from('tickets').select('created_at').limit(0) },
      { name: 'updated_at', query: () => supabase.from('tickets').select('updated_at').limit(0) }
    ]

    const results = {}

    for (const test of tests) {
      try {
        const { error } = await test.query()
        results[test.name] = error ? false : true
        console.log(`Column ${test.name}: ${results[test.name] ? '✅' : '❌'}`)
      } catch (e) {
        results[test.name] = false
        console.log(`Column ${test.name}: ❌ (${e.message})`)
      }
    }

    return {
      success: true,
      columns: results,
      existingColumns: Object.keys(results).filter(col => results[col])
    }

  } catch (error) {
    console.error('❌ Column check error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}