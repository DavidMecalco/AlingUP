import { supabase } from './supabaseClient'

/**
 * Service for comprehensive search functionality across tickets
 */
class SearchService {
  /**
   * Perform global search across tickets, descriptions, and IDs
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async globalSearch(query, options = {}) {
    try {
      const {
        limit = 50,
        includeHighlights = true,
        searchFields = ['titulo', 'descripcion', 'ticket_number'],
        filters = {}
      } = options

      if (!query || query.trim().length < 2) {
        return { data: [], error: null }
      }

      const searchTerm = query.trim()
      
      // Build search conditions for different fields
      const searchConditions = []
      
      if (searchFields.includes('titulo')) {
        searchConditions.push(`titulo.ilike.%${searchTerm}%`)
      }
      
      if (searchFields.includes('descripcion')) {
        searchConditions.push(`descripcion.ilike.%${searchTerm}%`)
      }
      
      if (searchFields.includes('ticket_number')) {
        searchConditions.push(`ticket_number.ilike.%${searchTerm}%`)
      }

      let supabaseQuery = supabase
        .from('tickets')
        .select(`
          *,
          cliente:cliente_id(id, email, nombre_completo, empresa_cliente),
          tecnico:tecnico_id(id, email, nombre_completo),
          tipo_ticket:tipo_ticket_id(id, nombre, descripcion, color)
        `)
        .or(searchConditions.join(','))

      // Apply additional filters
      if (filters.estados && filters.estados.length > 0) {
        supabaseQuery = supabaseQuery.in('estado', filters.estados)
      }

      if (filters.prioridades && filters.prioridades.length > 0) {
        supabaseQuery = supabaseQuery.in('prioridad', filters.prioridades)
      }

      if (filters.tipos && filters.tipos.length > 0) {
        supabaseQuery = supabaseQuery.in('tipo_ticket_id', filters.tipos)
      }

      if (filters.tecnicos && filters.tecnicos.length > 0) {
        supabaseQuery = supabaseQuery.in('tecnico_id', filters.tecnicos)
      }

      if (filters.clientes && filters.clientes.length > 0) {
        supabaseQuery = supabaseQuery.in('cliente_id', filters.clientes)
      }

      // Apply date filters
      if (filters.fecha_desde) {
        supabaseQuery = supabaseQuery.gte('created_at', filters.fecha_desde.toISOString())
      }

      if (filters.fecha_hasta) {
        supabaseQuery = supabaseQuery.lte('created_at', filters.fecha_hasta.toISOString())
      }

      // Order by relevance (created_at desc for now, could be enhanced with ranking)
      supabaseQuery = supabaseQuery
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data, error } = await supabaseQuery

      if (error) {
        console.error('Global search error:', error)
        return { data: [], error }
      }

      // Add highlights if requested
      let results = data || []
      if (includeHighlights && results.length > 0) {
        results = this.addSearchHighlights(results, searchTerm, searchFields)
      }

      return { data: results, error: null }
    } catch (error) {
      console.error('Global search error:', error)
      return { 
        data: [], 
        error: { message: 'Error en la búsqueda global' } 
      }
    }
  }

  /**
   * Add search highlights to results
   * @param {Array} results - Search results
   * @param {string} searchTerm - Search term to highlight
   * @param {Array} searchFields - Fields to highlight
   * @returns {Array} Results with highlights
   */
  addSearchHighlights(results, searchTerm, searchFields) {
    const highlightTerm = searchTerm.toLowerCase()
    
    return results.map(ticket => {
      const highlighted = { ...ticket }
      
      searchFields.forEach(field => {
        if (ticket[field] && typeof ticket[field] === 'string') {
          const fieldValue = ticket[field]
          const lowerFieldValue = fieldValue.toLowerCase()
          
          if (lowerFieldValue.includes(highlightTerm)) {
            // Create highlighted version
            const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi')
            highlighted[`${field}_highlighted`] = fieldValue.replace(
              regex, 
              '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
            )
          }
        }
      })
      
      return highlighted
    })
  }

  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} partialQuery - Partial search query
   * @param {number} limit - Maximum number of suggestions
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getSearchSuggestions(partialQuery, limit = 10) {
    try {
      if (!partialQuery || partialQuery.trim().length < 2) {
        return { data: [], error: null }
      }

      const searchTerm = partialQuery.trim()

      // Get suggestions from ticket titles and numbers
      const { data, error } = await supabase
        .from('tickets')
        .select('id, titulo, ticket_number')
        .or(`titulo.ilike.%${searchTerm}%,ticket_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Search suggestions error:', error)
        return { data: [], error }
      }

      // Format suggestions
      const suggestions = (data || []).map(ticket => ({
        id: ticket.id,
        text: ticket.titulo,
        type: 'ticket',
        subtitle: ticket.ticket_number,
        value: ticket.titulo
      }))

      return { data: suggestions, error: null }
    } catch (error) {
      console.error('Search suggestions error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener sugerencias' } 
      }
    }
  }

  /**
   * Save search to history
   * @param {string} query - Search query
   * @param {string} userId - User ID
   * @returns {Promise<{error: Object|null}>}
   */
  async saveSearchHistory(query, userId) {
    try {
      if (!query || !userId || query.trim().length < 2) {
        return { error: null }
      }

      // Check if search already exists in history
      const { data: existing } = await supabase
        .from('search_history')
        .select('id')
        .eq('user_id', userId)
        .eq('query', query.trim())
        .single()

      if (existing) {
        // Update timestamp if already exists
        const { error } = await supabase
          .from('search_history')
          .update({ searched_at: new Date().toISOString() })
          .eq('id', existing.id)

        return { error }
      } else {
        // Insert new search history entry
        const { error } = await supabase
          .from('search_history')
          .insert({
            user_id: userId,
            query: query.trim(),
            searched_at: new Date().toISOString()
          })

        return { error }
      }
    } catch (error) {
      console.error('Save search history error:', error)
      return { error: { message: 'Error al guardar historial de búsqueda' } }
    }
  }

  /**
   * Get user's search history
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of history items
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getSearchHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get search history error:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get search history error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener historial de búsqueda' } 
      }
    }
  }

  /**
   * Save a search as favorite
   * @param {string} query - Search query
   * @param {string} name - Saved search name
   * @param {string} userId - User ID
   * @param {Object} filters - Search filters
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async saveFavoriteSearch(query, name, userId, filters = {}) {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          name: name.trim(),
          query: query.trim(),
          filters: filters,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Save favorite search error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Save favorite search error:', error)
      return { 
        data: null, 
        error: { message: 'Error al guardar búsqueda favorita' } 
      }
    }
  }

  /**
   * Get user's saved searches
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getSavedSearches(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get saved searches error:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get saved searches error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener búsquedas guardadas' } 
      }
    }
  }

  /**
   * Delete a saved search
   * @param {string} searchId - Saved search ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteSavedSearch(searchId, userId) {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', userId)

      if (error) {
        console.error('Delete saved search error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete saved search error:', error)
      return { error: { message: 'Error al eliminar búsqueda guardada' } }
    }
  }
}

// Create and export singleton instance
const searchService = new SearchService()
export default searchService