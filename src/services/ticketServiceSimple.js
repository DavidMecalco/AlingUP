import { supabase } from './supabaseClient'

/**
 * Simplified ticket service for creating tickets without complex validation
 */
class SimpleTicketService {
  /**
   * Create a new ticket with minimal validation
   * @param {Object} ticketData - Ticket data
   * @param {string} clienteId - Client ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createTicket(ticketData, clienteId) {
    try {
      console.log('🎫 Creating ticket with simplified service:', ticketData)

      // Basic validation
      if (!ticketData.titulo || !clienteId) {
        return {
          data: null,
          error: { message: 'Título y cliente son requeridos' }
        }
      }

      // Check if user exists (simple check)
      console.log('🔍 Step 1: Checking user exists...')
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, rol, estado')
        .eq('id', clienteId)
        .single()

      console.log('📊 User query result:', { user, userError })

      if (userError || !user) {
        console.error('❌ User not found:', userError)
        return {
          data: null,
          error: { message: 'Usuario no encontrado' }
        }
      }

      if (user.estado === false) {
        console.log('❌ User is inactive')
        return {
          data: null,
          error: { message: 'Usuario inactivo' }
        }
      }

      console.log('✅ Step 1 complete: User found:', user)

      // Skip ticket type validation for now
      console.log('⏭️ Step 2: Skipping ticket type validation')

      // Generate ticket number
      console.log('🎲 Step 3: Generating ticket number...')
      const ticketNumber = `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      console.log('✅ Generated ticket number:', ticketNumber)

      // Prepare ticket data
      console.log('📋 Step 4: Preparing ticket data...')
      const ticketToInsert = {
        ticket_number: ticketNumber,
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion || '',
        prioridad: ticketData.prioridad || 'media',
        cliente_id: clienteId,
        estado: 'abierto',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('✅ Step 4 complete: Ticket data prepared')
      console.log('📝 Step 5: About to insert ticket:', ticketToInsert)

      // Insert ticket
      // First, let's test if we can query the tickets table
      console.log('🔍 Step 5.5: Testing tickets table access...')
      const { data: testQuery, error: testError } = await supabase
        .from('tickets')
        .select('id')
        .limit(1)

      console.log('📊 Tickets table test:', { testQuery, testError })

      if (testError) {
        console.error('❌ Cannot access tickets table:', testError)
        return {
          data: null,
          error: { message: `No se puede acceder a la tabla de tickets: ${testError.message}` }
        }
      }

      console.log('✅ Tickets table is accessible')
      console.log('💾 Step 6: Inserting into database...')
      const { data: ticket, error: insertError } = await supabase
        .from('tickets')
        .insert(ticketToInsert)
        .select('*')
        .single()

      console.log('📊 Insert result:', { ticket, insertError })

      if (insertError) {
        console.error('❌ Step 6 failed: Insert error:', insertError)
        console.error('❌ Insert error details:', JSON.stringify(insertError, null, 2))
        console.error('❌ Data being inserted:', JSON.stringify(ticketToInsert, null, 2))
        return {
          data: null,
          error: { message: `Error al crear ticket: ${insertError.message || insertError.details || 'Error desconocido'}` }
        }
      }

      console.log('✅ Step 6 complete: Ticket created successfully:', ticket)
      console.log('🎉 All steps completed successfully!')
      return { data: ticket, error: null }

    } catch (error) {
      console.error('❌ Unexpected error:', error)
      return {
        data: null,
        error: { message: `Error inesperado: ${error.message}` }
      }
    }
  }
}

// Create and export singleton instance
const simpleTicketService = new SimpleTicketService()
export default simpleTicketService