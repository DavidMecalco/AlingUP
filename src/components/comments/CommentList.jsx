import React from 'react'

const CommentList = ({ ticketId, onCommentCountChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </p>
      </div>
    </div>
  )
}

export default CommentList