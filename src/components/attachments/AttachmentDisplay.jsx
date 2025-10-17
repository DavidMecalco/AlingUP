import { useState, useEffect } from 'react'
import ImageGallery from './ImageGallery.jsx'
import VideoPlayer from './VideoPlayer.jsx'
import DocumentViewer from './DocumentViewer.jsx'
import AudioPlayer from './AudioPlayer.jsx'
import { getTicketAttachments } from '../../services/fileService.js'

const AttachmentDisplay = ({ ticketId, className = '' }) => {
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (ticketId) {
      loadAttachments()
    }
  }, [ticketId])

  const loadAttachments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getTicketAttachments(ticketId)
      
      if (result.success) {
        setAttachments(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Error al cargar los archivos adjuntos')
      console.error('Load attachments error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group attachments by type
  const groupedAttachments = {
    images: attachments.filter(att => att.tipo === 'foto'),
    videos: attachments.filter(att => att.tipo === 'video'),
    documents: attachments.filter(att => att.tipo === 'documento'),
    audio: attachments.filter(att => att.tipo === 'nota_voz')
  }

  const totalCount = attachments.length
  const counts = {
    images: groupedAttachments.images.length,
    videos: groupedAttachments.videos.length,
    documents: groupedAttachments.documents.length,
    audio: groupedAttachments.audio.length
  }

  const tabs = [
    { id: 'all', label: 'Todos', count: totalCount },
    { id: 'images', label: 'Imágenes', count: counts.images },
    { id: 'videos', label: 'Videos', count: counts.videos },
    { id: 'documents', label: 'Documentos', count: counts.documents },
    { id: 'audio', label: 'Audio', count: counts.audio }
  ]

  const getFilteredAttachments = () => {
    switch (activeTab) {
      case 'images':
        return groupedAttachments.images
      case 'videos':
        return groupedAttachments.videos
      case 'documents':
        return groupedAttachments.documents
      case 'audio':
        return groupedAttachments.audio
      default:
        return attachments
    }
  }

  if (loading) {
    return (
      <div className={`attachment-display ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando archivos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`attachment-display ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadAttachments}
            className="mt-3 text-sm text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className={`attachment-display ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No hay archivos adjuntos</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`attachment-display ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs
                  ${activeTab === tab.id
                    ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900 dark:text-fuchsia-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'all' && (
          <>
            {counts.images > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Imágenes ({counts.images})
                </h3>
                <ImageGallery images={groupedAttachments.images} />
              </div>
            )}
            
            {counts.videos > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Videos ({counts.videos})
                </h3>
                <VideoPlayer videos={groupedAttachments.videos} />
              </div>
            )}
            
            {counts.documents > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Documentos ({counts.documents})
                </h3>
                <DocumentViewer documents={groupedAttachments.documents} />
              </div>
            )}
            
            {counts.audio > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Notas de Voz ({counts.audio})
                </h3>
                <AudioPlayer audioFiles={groupedAttachments.audio} />
              </div>
            )}
          </>
        )}

        {activeTab === 'images' && (
          <ImageGallery images={groupedAttachments.images} />
        )}

        {activeTab === 'videos' && (
          <VideoPlayer videos={groupedAttachments.videos} />
        )}

        {activeTab === 'documents' && (
          <DocumentViewer documents={groupedAttachments.documents} />
        )}

        {activeTab === 'audio' && (
          <AudioPlayer audioFiles={groupedAttachments.audio} />
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadAttachments}
          className="text-sm text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 transition-colors"
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>
  )
}

export default AttachmentDisplay