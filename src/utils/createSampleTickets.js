import { supabase } from '../services/supabaseClient'

/**
 * Create sample tickets for testing the Kanban board
 */
export async function createSampleTickets() {
  try {
    console.log('Creating sample tickets...')

    // First, get users to assign tickets
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, rol, nombre_completo')

    if (usersError) {
      console.error('Error getting users:', usersError)
      return { success: false, error: usersError.message }
    }

    const adminUser = users.find(u => u.rol === 'admin')
    const tecnicoUser = users.find(u => u.rol === 'tecnico')
    const clienteUser = users.find(u => u.rol === 'cliente')

    if (!adminUser || !tecnicoUser || !clienteUser) {
      return { 
        success: false, 
        error: 'No se encontraron usuarios de todos los roles necesarios. Crea usuarios de prueba primero.' 
      }
    }

    // Get ticket types
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .select('id, nombre')
      .limit(1)

    if (typesError || !ticketTypes.length) {
      console.error('Error getting ticket types:', typesError)
      return { success: false, error: 'No se encontraron tipos de tickets' }
    }

    const sampleTickets = [
      {
        titulo: 'Error en el sistema de login',
        descripcion: 'Los usuarios no pueden acceder al sistema. Se muestra un error 500 al intentar iniciar sesión.',
        prioridad: 'urgente',
        estado: 'abierto',
        cliente_id: clienteUser.id,
        tecnico_id: null,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Actualización de base de datos',
        descripcion: 'Necesitamos actualizar la estructura de la base de datos para incluir nuevos campos.',
        prioridad: 'alta',
        estado: 'en_progreso',
        cliente_id: clienteUser.id,
        tecnico_id: tecnicoUser.id,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Mejora en la interfaz de usuario',
        descripcion: 'Implementar mejoras visuales en el dashboard principal para mejorar la experiencia del usuario.',
        prioridad: 'media',
        estado: 'vobo',
        cliente_id: clienteUser.id,
        tecnico_id: tecnicoUser.id,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Documentación de API',
        descripcion: 'Crear documentación completa de la API REST para desarrolladores externos.',
        prioridad: 'baja',
        estado: 'cerrado',
        cliente_id: clienteUser.id,
        tecnico_id: tecnicoUser.id,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Problema con notificaciones',
        descripcion: 'Las notificaciones por email no se están enviando correctamente a los usuarios.',
        prioridad: 'alta',
        estado: 'abierto',
        cliente_id: clienteUser.id,
        tecnico_id: null,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Optimización de rendimiento',
        descripcion: 'El sistema está lento en horas pico. Necesitamos optimizar las consultas de base de datos.',
        prioridad: 'media',
        estado: 'en_progreso',
        cliente_id: clienteUser.id,
        tecnico_id: tecnicoUser.id,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Backup automático',
        descripcion: 'Configurar sistema de backup automático para la base de datos de producción.',
        prioridad: 'media',
        estado: 'vobo',
        cliente_id: clienteUser.id,
        tecnico_id: tecnicoUser.id,
        tipo_ticket_id: ticketTypes[0].id
      },
      {
        titulo: 'Actualización de dependencias',
        descripcion: 'Actualizar todas las dependencias del proyecto a sus versiones más recientes.',
        prioridad: 'baja',
        estado: 'abierto',
        cliente_id: clienteUser.id,
        tecnico_id: null,
        tipo_ticket_id: ticketTypes[0].id
      }
    ]

    const results = []

    for (const ticket of sampleTickets) {
      try {
        // Generate ticket number
        const ticketNumber = `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        const { data, error } = await supabase
          .from('tickets')
          .insert({
            ...ticket,
            ticket_number: ticketNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating ticket "${ticket.titulo}":`, error)
          results.push({
            titulo: ticket.titulo,
            success: false,
            error: error.message
          })
        } else {
          console.log(`Created ticket: ${ticket.titulo}`)
          results.push({
            titulo: ticket.titulo,
            success: true,
            data: data
          })
        }
      } catch (error) {
        console.error(`Unexpected error creating ticket "${ticket.titulo}":`, error)
        results.push({
          titulo: ticket.titulo,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return {
      success: successCount > 0,
      message: `Creados ${successCount}/${totalCount} tickets de ejemplo`,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      }
    }

  } catch (error) {
    console.error('Error creating sample tickets:', error)
    return {
      success: false,
      message: `Error creando tickets de ejemplo: ${error.message}`,
      error: error.message
    }
  }
}

/**
 * Check if sample tickets already exist
 */
export async function checkSampleTickets() {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, titulo, estado, prioridad')
      .limit(10)

    if (error) {
      console.error('Error checking sample tickets:', error)
      return {
        success: false,
        error: error.message,
        tickets: []
      }
    }

    return {
      success: true,
      tickets: tickets || [],
      count: tickets?.length || 0,
      message: `Encontrados ${tickets?.length || 0} tickets en la base de datos`
    }

  } catch (error) {
    console.error('Error checking sample tickets:', error)
    return {
      success: false,
      error: error.message,
      tickets: []
    }
  }
}