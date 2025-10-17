import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import commentService from '../../services/commentService'
import CustomRichTextEditor from '../editor/CustomRichTextEditor'

const CommentForm = ({ ticketId, onCommentAdded }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() || submitting) return

    try {
      setSubmitting(true)
      setError(null)
      
      const result = await commentService.createComment(ticketId, content, user.id)
      
      if (result.error) {
        setError(result.error.message || 'Error al crear comentario')
      } else {
        // Clear form
        setContent('')
        setIsExpanded(false)
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded(result.data)
        }
      }
    } catch (err) {
      console.error('Create comment error:', err)
      setError('Error al crear comentario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setIsExpanded(false)
    setError(null)
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when form is focused
      if (!isExpanded) return

      // Ctrl/Cmd + Enter: Submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (content.trim() && !submitting) {
          handleSubmit(e)
        }
      }

      // Escape: Cancel
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded, content, submitting])

  if (!user) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-700 dark:text-yellow-300">
          Debes iniciar sesión para comentar.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user.profile?.nombre_completo?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user.profile?.nombre_completo || user.email}
            </span>
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {user.profile?.rol === 'cliente' ? 'Cliente' : 
               user.profile?.rol === 'tecnico' ? 'Técnico' : 
               user.profile?.rol === 'admin' ? 'Admin' : 'Usuario'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="space-y-3">
          {isExpanded ? (
            /* Rich Text Editor */
            <div>
              <CustomRichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe tu comentario..."
                height={200}
                enableVoiceNotes={true}
                enableImageUpload={true}
                disabled={submitting}
              />
            </div>
          ) : (
            /* Simple Textarea */
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Escribe tu comentario... (haz clic para más opciones de formato)"
              disabled={submitting}
            />
          )}
        </div>

        {/* Action Buttons */}
        {(isExpanded || content.trim()) && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isExpanded ? (
                <span>Usa el editor para dar formato a tu comentario</span>
              ) : (
                <span>Presiona Tab + Enter para enviar</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {isExpanded && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Comentar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        {isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <strong>Atajos de teclado:</strong>
              </div>
              <div>
                <strong>Formato:</strong>
              </div>
              <div>
                • Ctrl/Cmd + Enter: Enviar comentario
              </div>
              <div>
                • Ctrl/Cmd + B: Negrita
              </div>
              <div>
                • Escape: Cancelar
              </div>
              <div>
                • Ctrl/Cmd + I: Cursiva
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default CommentForm