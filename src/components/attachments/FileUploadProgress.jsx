import React from 'react'

const FileUploadProgress = ({ files, onRemoveFile, onClearAll }) => {
  if (!files || files.length === 0) return null

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4l2-2v6l-2-2v4H7V5z" clipRule="evenodd" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      case 'audio':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.076-1.343-4.343a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status, progress) => {
    switch (status) {
      case 'uploading':
        return (
          <div className="w-5 h-5">
            <svg className="animate-spin w-full h-full text-fuchsia-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Archivos seleccionados ({files.length})
        </h4>
        {files.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="space-y-3">
        {files.map((fileItem) => (
          <div
            key={fileItem.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(fileItem.type)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {fileItem.name}
                </p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(fileItem.status, fileItem.progress)}
                  <button
                    onClick={() => onRemoveFile(fileItem.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar archivo"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(fileItem.size)}
                </p>
                
                {fileItem.status === 'uploading' && (
                  <span className="text-xs text-fuchsia-600 dark:text-fuchsia-400">
                    {fileItem.progress}%
                  </span>
                )}
                
                {fileItem.status === 'error' && fileItem.error && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    {fileItem.error}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {fileItem.status === 'uploading' && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-fuchsia-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview for images */}
            {fileItem.preview && (
              <div className="flex-shrink-0">
                <img
                  src={fileItem.preview}
                  alt={fileItem.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUploadProgress