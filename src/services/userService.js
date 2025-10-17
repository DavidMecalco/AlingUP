import { supabase } from './supabaseClient'

/**
 * Service for managing users and technician operations
 */
class UserService {
  /**
   * Get all technicians with their current workload
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getTechniciansWithWorkload() {
    try {
      // Get all active technicians
      const { data: technicians, error: techError } = await supabase
        .from('users')
        .select('id, nombre_completo, email')
        .eq('rol', 'tecnico')
        .eq('estado', true)
        .order('nombre_completo')

      if (techError) {
        console.error('Get technicians error:', techError)
        return { data: [], error: techError }
      }

      // Get workload for each technician
      const techniciansWithWorkload = await Promise.all(
        technicians.map(async (tech) => {
          const { data: tickets, error: ticketError } = await supabase
            .from('tickets')
            .select('id, estado, prioridad')
            .eq('tecnico_id', tech.id)
            .neq('estado', 'cerrado')

          if (ticketError) {
            console.error(`Get workload for technician ${tech.id} error:`, ticketError)
            return {
              ...tech,
              workload: {
                total: 0,
                abierto: 0,
                en_progreso: 0,
                vobo: 0,
                byPriority: { baja: 0, media: 0, alta: 0, urgente: 0 }
              }
            }
          }

          // Calculate workload statistics
          const workload = {
            total: tickets.length,
            abierto: tickets.filter(t => t.estado === 'abierto').length,
            en_progreso: tickets.filter(t => t.estado === 'en_progreso').length,
            vobo: tickets.filter(t => t.estado === 'vobo').length,
            byPriority: {
              baja: tickets.filter(t => t.prioridad === 'baja').length,
              media: tickets.filter(t => t.prioridad === 'media').length,
              alta: tickets.filter(t => t.prioridad === 'alta').length,
              urgente: tickets.filter(t => t.prioridad === 'urgente').length
            }
          }

          return {
            ...tech,
            workload
          }
        })
      )

      return { data: techniciansWithWorkload, error: null }
    } catch (error) {
      console.error('Get technicians with workload error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener técnicos' } 
      }
    }
  }

  /**
   * Get all users by role
   * @param {string} role - User role to filter by
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getUsersByRole(role) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre_completo, email, empresa_cliente')
        .eq('rol', role)
        .eq('estado', true)
        .order('nombre_completo')

      if (error) {
        console.error(`Get users by role ${role} error:`, error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error(`Get users by role ${role} error:`, error)
      return { 
        data: [], 
        error: { message: `Error al obtener usuarios con rol ${role}` } 
      }
    }
  }

  /**
   * Get technician workload summary
   * @param {string} tecnicoId - Technician ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getTechnicianWorkload(tecnicoId) {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, estado, prioridad, created_at')
        .eq('tecnico_id', tecnicoId)
        .neq('estado', 'cerrado')

      if (error) {
        console.error(`Get technician workload error:`, error)
        return { data: null, error }
      }

      const workload = {
        total: tickets.length,
        abierto: tickets.filter(t => t.estado === 'abierto').length,
        en_progreso: tickets.filter(t => t.estado === 'en_progreso').length,
        vobo: tickets.filter(t => t.estado === 'vobo').length,
        byPriority: {
          baja: tickets.filter(t => t.prioridad === 'baja').length,
          media: tickets.filter(t => t.prioridad === 'media').length,
          alta: tickets.filter(t => t.prioridad === 'alta').length,
          urgente: tickets.filter(t => t.prioridad === 'urgente').length
        },
        oldestTicket: tickets.length > 0 
          ? new Date(Math.min(...tickets.map(t => new Date(t.created_at))))
          : null
      }

      return { data: workload, error: null }
    } catch (error) {
      console.error('Get technician workload error:', error)
      return { 
        data: null, 
        error: { message: 'Error al obtener carga de trabajo' } 
      }
    }
  }

  /**
   * Get all users with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getUsers(filters = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.rol) {
        query = query.eq('rol', filters.rol)
      }

      if (filters.estado !== undefined) {
        query = query.eq('estado', filters.estado)
      }

      if (filters.search) {
        query = query.or(`nombre_completo.ilike.%${filters.search}%,email.ilike.%${filters.search}%,empresa_cliente.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Get users error:', error)
      return { data: null, error: { message: 'Error al obtener usuarios' } }
    }
  }

  /**
   * Create a new client user
   * @param {Object} clientData - Client data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createClient(clientData) {
    try {
      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword()

      // First create the auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: clientData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nombre_completo: clientData.nombre_completo,
          rol: 'cliente'
        }
      })

      if (authError) {
        return { data: null, error: authError }
      }

      // Then create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: clientData.email,
          nombre_completo: clientData.nombre_completo,
          telefono: clientData.telefono,
          empresa_cliente: clientData.empresa_cliente,
          direccion: clientData.direccion,
          ciudad: clientData.ciudad,
          pais: clientData.pais,
          logo_empresa: clientData.logo_empresa,
          contacto_principal: clientData.contacto_principal,
          departamento: clientData.departamento,
          rol: 'cliente',
          estado: true,
          fecha_registro: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return { data: null, error: profileError }
      }

      return { 
        data: { ...profile, tempPassword }, 
        error: null 
      }
    } catch (error) {
      console.error('Create client error:', error)
      return { data: null, error: { message: 'Error al crear cliente' } }
    }
  }

  /**
   * Create a new technician user
   * @param {Object} technicianData - Technician data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createTechnician(technicianData) {
    try {
      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword()

      // First create the auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: technicianData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nombre_completo: technicianData.nombre_completo,
          rol: 'tecnico'
        }
      })

      if (authError) {
        return { data: null, error: authError }
      }

      // Then create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: technicianData.email,
          nombre_completo: technicianData.nombre_completo,
          telefono: technicianData.telefono,
          rol_interno: technicianData.rol_interno,
          especialidad: technicianData.especialidad,
          nivel_experiencia: technicianData.nivel_experiencia,
          horario_trabajo: technicianData.horario_trabajo,
          clientes_asignados: technicianData.clientes_asignados || [],
          avatar: technicianData.avatar,
          rol: 'tecnico',
          estado: true,
          fecha_registro: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return { data: null, error: profileError }
      }

      return { 
        data: { ...profile, tempPassword }, 
        error: null 
      }
    } catch (error) {
      console.error('Create technician error:', error)
      return { data: null, error: { message: 'Error al crear técnico' } }
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Update user error:', error)
      return { data: null, error: { message: 'Error al actualizar usuario' } }
    }
  }

  /**
   * Delete user (soft delete by setting estado to false)
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async deleteUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ estado: false })
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Delete user error:', error)
      return { data: null, error: { message: 'Error al eliminar usuario' } }
    }
  }

  /**
   * Get clients for technician assignment
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getClients() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre_completo, email, empresa_cliente, telefono, logo_empresa')
        .eq('rol', 'cliente')
        .eq('estado', true)
        .order('nombre_completo')

      return { data, error }
    } catch (error) {
      console.error('Get clients error:', error)
      return { data: null, error: { message: 'Error al obtener clientes' } }
    }
  }

  /**
   * Get technicians
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getTechnicians() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('rol', 'tecnico')
        .eq('estado', true)
        .order('nombre_completo')

      return { data, error }
    } catch (error) {
      console.error('Get technicians error:', error)
      return { data: null, error: { message: 'Error al obtener técnicos' } }
    }
  }

  /**
   * Upload company logo
   * @param {File} file - Logo file
   * @param {string} companyName - Company name for file naming
   * @returns {Promise<{data: string|null, error: Object|null}>}
   */
  async uploadCompanyLogo(file, companyName) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (error) {
        return { data: null, error }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      return { data: publicUrl, error: null }
    } catch (error) {
      console.error('Upload logo error:', error)
      return { data: null, error: { message: 'Error al subir logo' } }
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar file
   * @param {string} userId - User ID
   * @returns {Promise<{data: string|null, error: Object|null}>}
   */
  async uploadAvatar(file, userId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (error) {
        return { data: null, error }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      return { data: publicUrl, error: null }
    } catch (error) {
      console.error('Upload avatar error:', error)
      return { data: null, error: { message: 'Error al subir avatar' } }
    }
  }

  /**
   * Generate temporary password
   * @returns {string}
   */
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}

// Create and export singleton instance
const userService = new UserService()
export default userService