import { supabase } from './supabaseClient'

/**
 * Crear ticket de la manera más simple posible
 */
export async function createBasicTicket(titulo, descripcion, prioridad = 'media') {
  try {
    console.log('📝 Creando ticket básico...')
    
    // Paso 1: Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }
    
    console.log('👤 Usuario actual:', user.id, user.email)
    
    // Paso 2: Obtener un tipo de ticket
    const { data: tipoTicket, error: tipoError } = await supabase
      .from('ticket_types')
      .select('id')
      .limit(1)
      .single()
    
    if (tipoError) {
      throw new Error(`Error obteniendo tipo de ticket: ${tipoError.message}`)
    }
    
    console.log('🎫 Tipo de ticket:', tipoTicket.id)
    
    // Paso 3: Crear el ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        titulo: titulo,
        descripcion: descripcion,
        estado: 'abierto',
        prioridad: prioridad,
        tipo_ticket_id: tipoTicket.id,
        cliente_id: user.id
      })
      .select()
      .single()
    
    if (ticketError) {
      throw new Error(`Error creando ticket: ${ticketError.message}`)
    }
    
    console.log('✅ Ticket creado:', ticket)
    
    return {
      success: true,
      ticket: ticket
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}