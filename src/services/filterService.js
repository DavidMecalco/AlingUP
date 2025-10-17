import { supabase } from './supabaseClient'

/**
 * Service for managing filter persistence and favorite filter combinations
 */
class FilterService {
  /**
   * Save a filter combination as favorite
   * @param {string} name - Filter name
   * @param {Object} filters - Filter configuration
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async saveFavoriteFilter(name, filters, userId) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: userId,
          name: name.trim(),
          filters: filters,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Save favorite filter error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Save favorite filter error:', error)
      return { 
        data: null, 
        error: { message: 'Error al guardar filtro favorito' } 
      }
    }
  }

  /**
   * Get user's saved filters
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getSavedFilters(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get saved filters error:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get saved filters error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener filtros guardados' } 
      }
    }
  }

  /**
   * Update a saved filter
   * @param {string} filterId - Filter ID
   * @param {string} name - New filter name
   * @param {Object} filters - New filter configuration
   * @param {string} userId - User ID (for security)
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async updateSavedFilter(filterId, name, filters, userId) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .update({
          name: name.trim(),
          filters: filters,
          updated_at: new Date().toISOString()
        })
        .eq('id', filterId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Update saved filter error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update saved filter error:', error)
      return { 
        data: null, 
        error: { message: 'Error al actualizar filtro guardado' } 
      }
    }
  }

  /**
   * Delete a saved filter
   * @param {string} filterId - Filter ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteSavedFilter(filterId, userId) {
    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', filterId)
        .eq('user_id', userId)

      if (error) {
        console.error('Delete saved filter error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete saved filter error:', error)
      return { error: { message: 'Error al eliminar filtro guardado' } }
    }
  }

  /**
   * Get filter presets (system-defined common filters)
   * @returns {Array} Array of filter presets
   */
  getFilterPresets() {
    return [
      {
        id: 'urgent_open',
        name: 'Tickets urgentes abiertos',
        description: 'Tickets con prioridad urgente en estado abierto',
        filters: {
          prioridades: ['urgente'],
          estados: ['abierto']
        }
      },
      {
        id: 'high_priority_in_progress',
        name: 'Alta prioridad en progreso',
        description: 'Tickets de alta prioridad que están siendo trabajados',
        filters: {
          prioridades: ['alta', 'urgente'],
          estados: ['en_progreso']
        }
      },
      {
        id: 'pending_vobo',
        name: 'Pendientes de VoBo',
        description: 'Tickets esperando validación',
        filters: {
          estados: ['vobo']
        }
      },
      {
        id: 'closed_last_week',
        name: 'Cerrados última semana',
        description: 'Tickets cerrados en los últimos 7 días',
        filters: {
          estados: ['cerrado'],
          fecha_desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          fecha_hasta: new Date()
        }
      },
      {
        id: 'unassigned',
        name: 'Sin asignar',
        description: 'Tickets que no tienen técnico asignado',
        filters: {
          tecnicos: [],
          estados: ['abierto', 'en_progreso']
        }
      }
    ]
  }

  /**
   * Save current filter state to localStorage for persistence across sessions
   * @param {Object} filters - Current filter state
   * @param {string} userId - User ID
   * @param {string} context - Context identifier (e.g., 'dashboard', 'kanban')
   */
  saveFilterState(filters, userId, context = 'default') {
    try {
      const key = `filter_state_${userId}_${context}`
      localStorage.setItem(key, JSON.stringify({
        filters,
        timestamp: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error saving filter state:', error)
    }
  }

  /**
   * Load filter state from localStorage
   * @param {string} userId - User ID
   * @param {string} context - Context identifier
   * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
   * @returns {Object|null} Saved filter state or null
   */
  loadFilterState(userId, context = 'default', maxAge = 24 * 60 * 60 * 1000) {
    try {
      const key = `filter_state_${userId}_${context}`
      const saved = localStorage.getItem(key)
      
      if (!saved) return null

      const { filters, timestamp } = JSON.parse(saved)
      const age = Date.now() - new Date(timestamp).getTime()

      // Return null if saved state is too old
      if (age > maxAge) {
        localStorage.removeItem(key)
        return null
      }

      return filters
    } catch (error) {
      console.error('Error loading filter state:', error)
      return null
    }
  }

  /**
   * Clear saved filter state
   * @param {string} userId - User ID
   * @param {string} context - Context identifier
   */
  clearFilterState(userId, context = 'default') {
    try {
      const key = `filter_state_${userId}_${context}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error clearing filter state:', error)
    }
  }

  /**
   * Validate filter configuration
   * @param {Object} filters - Filter configuration to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateFilters(filters) {
    const errors = []
    const validatedFilters = { ...filters }

    // Validate date range
    if (filters.fecha_desde && filters.fecha_hasta) {
      const startDate = new Date(filters.fecha_desde)
      const endDate = new Date(filters.fecha_hasta)
      
      if (startDate > endDate) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin')
      }
      
      // Check if dates are not too far in the future
      const now = new Date()
      if (startDate > now || endDate > now) {
        errors.push('Las fechas no pueden ser futuras')
      }
    }

    // Validate array filters
    const arrayFilters = ['estados', 'prioridades', 'tipos', 'tecnicos', 'clientes']
    arrayFilters.forEach(filterKey => {
      if (filters[filterKey] && !Array.isArray(filters[filterKey])) {
        errors.push(`${filterKey} debe ser un array`)
        validatedFilters[filterKey] = []
      }
    })

    // Remove empty arrays and null/undefined values
    Object.keys(validatedFilters).forEach(key => {
      const value = validatedFilters[key]
      if (value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0)) {
        delete validatedFilters[key]
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      validatedFilters
    }
  }

  /**
   * Convert filters to URL search parameters
   * @param {Object} filters - Filter configuration
   * @returns {URLSearchParams} URL search parameters
   */
  filtersToURLParams(filters) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (value instanceof Date) {
          params.set(key, value.toISOString().split('T')[0])
        } else if (typeof value === 'string' || typeof value === 'number') {
          params.set(key, value.toString())
        }
      }
    })

    return params
  }

  /**
   * Parse filters from URL search parameters
   * @param {URLSearchParams} params - URL search parameters
   * @returns {Object} Filter configuration
   */
  filtersFromURLParams(params) {
    const filters = {}
    const arrayFilters = ['estados', 'prioridades', 'tipos', 'tecnicos', 'clientes']
    const dateFilters = ['fecha_desde', 'fecha_hasta']

    for (const [key, value] of params.entries()) {
      if (arrayFilters.includes(key)) {
        filters[key] = value.split(',').filter(v => v.trim())
      } else if (dateFilters.includes(key)) {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          filters[key] = date
        }
      } else {
        filters[key] = value
      }
    }

    return filters
  }
}

// Create and export singleton instance
const filterService = new FilterService()
export default filterService