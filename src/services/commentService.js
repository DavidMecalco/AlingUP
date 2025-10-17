import { supabase } from './supabaseClient'

/**
 * Service for managing ticket comments with CRUD operations
 */
class CommentService {
  /**
   * Get all comments for a ticket
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{data: Array, error: Object|null}>}
   */
  async getCommentsByTicket(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          user:user_id(id, nombre_completo, email, rol)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Get comments error:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Get comments error:', error)
      return { 
        data: [], 
        error: { message: 'Error al obtener comentarios' } 
      }
    }
  }

  /**
   * Create a new comment
   * @param {string} ticketId - Ticket ID
   * @param {string} content - Comment content (HTML)
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async createComment(ticketId, content, userId) {
    try {
      // Sanitize HTML content
      const sanitizedContent = this.sanitizeHtmlContent(content)

      const { data, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          contenido: sanitizedContent,
          user_id: userId
        })
        .select(`
          *,
          user:user_id(id, nombre_completo, email, rol)
        `)
        .single()

      if (error) {
        console.error('Create comment error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Create comment error:', error)
      return { 
        data: null, 
        error: { message: 'Error al crear comentario' } 
      }
    }
  }

  /**
   * Update an existing comment
   * @param {string} commentId - Comment ID
   * @param {string} content - Updated content (HTML)
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async updateComment(commentId, content, userId) {
    try {
      // Sanitize HTML content
      const sanitizedContent = this.sanitizeHtmlContent(content)

      const { data, error } = await supabase
        .from('ticket_comments')
        .update({
          contenido: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', userId) // Ensure user can only update their own comments
        .select(`
          *,
          user:user_id(id, nombre_completo, email, rol)
        `)
        .single()

      if (error) {
        console.error('Update comment error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update comment error:', error)
      return { 
        data: null, 
        error: { message: 'Error al actualizar comentario' } 
      }
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<{error: Object|null}>}
   */
  async deleteComment(commentId, userId) {
    try {
      const { error } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId) // Ensure user can only delete their own comments

      if (error) {
        console.error('Delete comment error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete comment error:', error)
      return { error: { message: 'Error al eliminar comentario' } }
    }
  }

  /**
   * Sanitize HTML content for comments
   * @param {string} htmlContent - HTML content to sanitize
   * @returns {string} - Sanitized HTML content
   */
  sanitizeHtmlContent(htmlContent) {
    // Basic sanitization - remove script tags and dangerous attributes
    if (!htmlContent) return ''
    
    return htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  /**
   * Subscribe to real-time comment updates for a ticket
   * @param {string} ticketId - Ticket ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToComments(ticketId, callback) {
    const subscription = supabase
      .channel(`ticket_comments:ticket_id=eq.${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription)
    }
  }

  /**
   * Get comment count for a ticket
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<{count: number, error: Object|null}>}
   */
  async getCommentCount(ticketId) {
    try {
      const { count, error } = await supabase
        .from('ticket_comments')
        .select('*', { count: 'exact', head: true })
        .eq('ticket_id', ticketId)

      if (error) {
        console.error('Get comment count error:', error)
        return { count: 0, error }
      }

      return { count: count || 0, error: null }
    } catch (error) {
      console.error('Get comment count error:', error)
      return { 
        count: 0, 
        error: { message: 'Error al obtener número de comentarios' } 
      }
    }
  }
}

// Create and export singleton instance
const commentService = new CommentService()
export default commentService