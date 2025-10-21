import { supabase } from '../services/supabaseClient'

/**
 * Default ticket types to seed if none exist
 */
const DEFAULT_TICKET_TYPES = [
  {
    nombre: 'Soporte Técnico',
    descripcion: 'Problemas técnicos generales con equipos o software',
    color: '#3B82F6'
  },
  {
    nombre: 'Mantenimiento',
    descripcion: 'Solicitudes de mantenimiento preventivo o correctivo',
    color: '#10B981'
  },
  {
    nombre: 'Instalación',
    descripcion: 'Instalación de nuevos equipos o software',
    color: '#8B5CF6'
  },
  {
    nombre: 'Capacitación',
    descripcion: 'Solicitudes de capacitación o entrenamiento',
    color: '#F59E0B'
  },
  {
    nombre: 'Consulta',
    descripcion: 'Consultas generales o solicitudes de información',
    color: '#6B7280'
  },
  {
    nombre: 'Emergencia',
    descripcion: 'Situaciones urgentes que requieren atención inmediata',
    color: '#EF4444'
  }
]

/**
 * Check if ticket types exist and seed them if they don't
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function ensureTicketTypesExist() {
  try {
    console.log('Checking if ticket types exist...')
    
    // Check if any ticket types exist
    const { data: existingTypes, error: checkError } = await supabase
      .from('ticket_types')
      .select('id, nombre')
      .limit(1)

    if (checkError) {
      console.error('Error checking ticket types:', checkError)
      return {
        success: false,
        message: `Error checking ticket types: ${checkError.message}`
      }
    }

    // If types exist, return success
    if (existingTypes && existingTypes.length > 0) {
      console.log('Ticket types already exist')
      return {
        success: true,
        message: 'Ticket types already exist',
        data: existingTypes
      }
    }

    console.log('No ticket types found, seeding default types...')

    // Insert default ticket types
    const { data: insertedTypes, error: insertError } = await supabase
      .from('ticket_types')
      .insert(DEFAULT_TICKET_TYPES)
      .select()

    if (insertError) {
      console.error('Error inserting ticket types:', insertError)
      return {
        success: false,
        message: `Error inserting ticket types: ${insertError.message}`
      }
    }

    console.log('Successfully seeded ticket types:', insertedTypes)
    return {
      success: true,
      message: `Successfully created ${insertedTypes.length} ticket types`,
      data: insertedTypes
    }

  } catch (error) {
    console.error('Unexpected error in ensureTicketTypesExist:', error)
    return {
      success: false,
      message: `Unexpected error: ${error.message}`
    }
  }
}

/**
 * Get all ticket types, ensuring they exist first
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getTicketTypesWithFallback() {
  try {
    // First ensure ticket types exist
    const seedResult = await ensureTicketTypesExist()
    
    if (!seedResult.success) {
      return {
        data: [],
        error: { message: seedResult.message }
      }
    }

    // Now get all ticket types
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (error) {
      console.error('Error getting ticket types:', error)
      return {
        data: [],
        error
      }
    }

    return {
      data: data || [],
      error: null
    }

  } catch (error) {
    console.error('Error in getTicketTypesWithFallback:', error)
    return {
      data: [],
      error: { message: error.message }
    }
  }
}