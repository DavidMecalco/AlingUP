import { supabase } from './supabaseClient'

/**
 * Service for managing ticket number generation and validation
 */
class TicketNumberService {
  /**
   * Generate a ticket number based on current year and count
   * This is a fallback method in case the database trigger fails
   * @returns {Promise<string>} Generated ticket number
   */
  async generateTicketNumber() {
    try {
      const currentYear = new Date().getFullYear()
      
      // Get count of tickets created this year
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${currentYear}-01-01T00:00:00.000Z`)
        .lt('created_at', `${currentYear + 1}-01-01T00:00:00.000Z`)

      if (error) {
        console.error('Error counting tickets:', error)
        // Fallback to timestamp-based number
        return `TKT-${currentYear}-${Date.now().toString().slice(-6)}`
      }

      const ticketCount = (count || 0) + 1
      const paddedCount = ticketCount.toString().padStart(3, '0')
      
      return `TKT-${currentYear}-${paddedCount}`
    } catch (error) {
      console.error('Error generating ticket number:', error)
      // Ultimate fallback
      const currentYear = new Date().getFullYear()
      return `TKT-${currentYear}-${Date.now().toString().slice(-6)}`
    }
  }

  /**
   * Validate ticket number format
   * @param {string} ticketNumber - Ticket number to validate
   * @returns {boolean} Whether the ticket number is valid
   */
  validateTicketNumber(ticketNumber) {
    if (!ticketNumber) return false
    
    // Format: TKT-YYYY-XXX (where XXX is 3 digits)
    const ticketNumberRegex = /^TKT-\d{4}-\d{3}$/
    return ticketNumberRegex.test(ticketNumber)
  }

  /**
   * Parse ticket number to extract year and sequence
   * @param {string} ticketNumber - Ticket number to parse
   * @returns {Object|null} Parsed components or null if invalid
   */
  parseTicketNumber(ticketNumber) {
    if (!this.validateTicketNumber(ticketNumber)) {
      return null
    }

    const parts = ticketNumber.split('-')
    return {
      prefix: parts[0], // 'TKT'
      year: parseInt(parts[1], 10),
      sequence: parseInt(parts[2], 10)
    }
  }

  /**
   * Check if a ticket number already exists
   * @param {string} ticketNumber - Ticket number to check
   * @returns {Promise<boolean>} Whether the ticket number exists
   */
  async ticketNumberExists(ticketNumber) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('ticket_number', ticketNumber)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking ticket number:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking ticket number:', error)
      return false
    }
  }

  /**
   * Get next available ticket number for the current year
   * @returns {Promise<string>} Next available ticket number
   */
  async getNextTicketNumber() {
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const ticketNumber = await this.generateTicketNumber()
      const exists = await this.ticketNumberExists(ticketNumber)
      
      if (!exists) {
        return ticketNumber
      }
      
      attempts++
      // Add small delay to avoid rapid-fire requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If we can't find a unique number, add timestamp suffix
    const baseNumber = await this.generateTicketNumber()
    const timestamp = Date.now().toString().slice(-3)
    return `${baseNumber}-${timestamp}`
  }

  /**
   * Format ticket number for display with styling
   * @param {string} ticketNumber - Ticket number to format
   * @returns {Object} Formatted display object
   */
  formatForDisplay(ticketNumber) {
    if (!ticketNumber) {
      return {
        display: 'Generando...',
        isValid: false,
        parts: null
      }
    }

    const parsed = this.parseTicketNumber(ticketNumber)
    
    return {
      display: ticketNumber,
      isValid: !!parsed,
      parts: parsed,
      shortDisplay: parsed ? `#${parsed.sequence}` : ticketNumber
    }
  }
}

// Create and export singleton instance
const ticketNumberService = new TicketNumberService()
export default ticketNumberService