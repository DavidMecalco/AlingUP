import timelineService from '../services/timelineService'

/**
 * Utility functions for creating timeline events automatically
 */

/**
 * Create timeline event when a comment is added
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User ID who added the comment
 * @param {string} userName - User name
 * @returns {Promise<void>}
 */
export const createCommentTimelineEvent = async (ticketId, userId, userName) => {
  try {
    await timelineService.createCommentAddedEvent(ticketId, userId, userName)
  } catch (error) {
    console.error('Error creating comment timeline event:', error)
    // Don't throw error to avoid breaking the main comment creation flow
  }
}

/**
 * Create timeline event when ticket state changes
 * @param {string} ticketId - Ticket ID
 * @param {string} oldState - Previous state
 * @param {string} newState - New state
 * @param {string} userId - User who changed the state
 * @returns {Promise<void>}
 */
export const createStateChangeTimelineEvent = async (ticketId, oldState, newState, userId) => {
  try {
    await timelineService.createStateChangedEvent(ticketId, oldState, newState, userId)
  } catch (error) {
    console.error('Error creating state change timeline event:', error)
    // Don't throw error to avoid breaking the main state change flow
  }
}

/**
 * Create timeline event when ticket is assigned
 * @param {string} ticketId - Ticket ID
 * @param {string} tecnicoId - Technician ID
 * @param {string} tecnicoName - Technician name
 * @param {string} assignedBy - User who made the assignment
 * @returns {Promise<void>}
 */
export const createAssignmentTimelineEvent = async (ticketId, tecnicoId, tecnicoName, assignedBy) => {
  try {
    await timelineService.createTicketAssignedEvent(ticketId, tecnicoId, tecnicoName, assignedBy)
  } catch (error) {
    console.error('Error creating assignment timeline event:', error)
    // Don't throw error to avoid breaking the main assignment flow
  }
}

/**
 * Create timeline event when file is uploaded
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User who uploaded the file
 * @param {string} fileName - File name
 * @param {string} fileType - File type
 * @returns {Promise<void>}
 */
export const createFileUploadTimelineEvent = async (ticketId, userId, fileName, fileType) => {
  try {
    await timelineService.createFileUploadedEvent(ticketId, userId, fileName, fileType)
  } catch (error) {
    console.error('Error creating file upload timeline event:', error)
    // Don't throw error to avoid breaking the main file upload flow
  }
}

/**
 * Create timeline event when ticket is created
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User who created the ticket
 * @param {string} ticketNumber - Ticket number
 * @returns {Promise<void>}
 */
export const createTicketCreationTimelineEvent = async (ticketId, userId, ticketNumber) => {
  try {
    await timelineService.createTicketCreatedEvent(ticketId, userId, ticketNumber)
  } catch (error) {
    console.error('Error creating ticket creation timeline event:', error)
    // Don't throw error to avoid breaking the main ticket creation flow
  }
}

/**
 * Create timeline event when ticket is closed
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User who closed the ticket
 * @returns {Promise<void>}
 */
export const createTicketClosureTimelineEvent = async (ticketId, userId) => {
  try {
    await timelineService.createTicketClosedEvent(ticketId, userId)
  } catch (error) {
    console.error('Error creating ticket closure timeline event:', error)
    // Don't throw error to avoid breaking the main closure flow
  }
}

/**
 * Create timeline event when ticket is reopened
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User who reopened the ticket
 * @returns {Promise<void>}
 */
export const createTicketReopenTimelineEvent = async (ticketId, userId) => {
  try {
    await timelineService.createTicketReopenedEvent(ticketId, userId)
  } catch (error) {
    console.error('Error creating ticket reopen timeline event:', error)
    // Don't throw error to avoid breaking the main reopen flow
  }
}

/**
 * Batch create multiple timeline events
 * @param {Array} events - Array of event objects with {ticketId, eventoTipo, descripcion, userId, datosAdicionales}
 * @returns {Promise<void>}
 */
export const createBatchTimelineEvents = async (events) => {
  try {
    const promises = events.map(event => 
      timelineService.createTimelineEvent(
        event.ticketId,
        event.eventoTipo,
        event.descripcion,
        event.userId,
        event.datosAdicionales
      )
    )
    
    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error creating batch timeline events:', error)
  }
}

export default {
  createCommentTimelineEvent,
  createStateChangeTimelineEvent,
  createAssignmentTimelineEvent,
  createFileUploadTimelineEvent,
  createTicketCreationTimelineEvent,
  createTicketClosureTimelineEvent,
  createTicketReopenTimelineEvent,
  createBatchTimelineEvents
}