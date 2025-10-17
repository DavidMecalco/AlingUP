import React from 'react'
import { getFileDownloadUrl } from '../../services/fileService.js'

const DocumentViewer = ({ documents, className = '' }) => {
  const getFileIcon = (fileName, mimeType) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'txt':
      case 'rtf':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamaño desconocido'
    
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (document) => {
    try {
      // For direct download, we can use the public URL
      const downloadUrl = document.url_storage || document.publicUrl
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = document.nombre_archivo || 'document'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open in new tab
      window.open(document.url_storage || document.publicUrl, '_blank')
    }
  }

  const handlePreview = (document) => {
    // Open document in new tab for preview
    window.open(document.url_storage || document.publicUrl, '_blank')
  }

  if (!documents || documents.length === 0) {
    return null
  }

  return (
    <div className={`document-viewer ${className}`}>
      <div className="space-y-3">
        {documents.map((document, index) => (
          <div
            key={document.id || index}
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {/* File Icon */}
            <div className="flex-shrink-0 mr-4">
              {getFileIcon(document.nombre_archivo, document.tipo)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {document.nombre_archivo || `Documento ${index + 1}`}
              </h4>
              <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(document.file_size)}</span>
                <span className="capitalize">
                  {document.nombre_archivo?.split('.').pop()?.toUpperCase() || 'DOC'}
                </span>
                {document.created_at && (
                  <span>
                    {new Date(document.created_at).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Preview Button (for PDFs) */}
              {document.nombre_archivo?.toLowerCase().endsWith('.pdf') && (
                <button
                  onClick={() => handlePreview(document)}
                  className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 transition-colors"
                  title="Vista previa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}

              {/* Download Button */}
              <button
                onClick={() => handleDownload(document)}
                className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 transition-colors"
                title="Descargar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* External Link Button */}
              <button
                onClick={() => handlePreview(document)}
                className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 transition-colors"
                title="Abrir en nueva pestaña"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DocumentViewer