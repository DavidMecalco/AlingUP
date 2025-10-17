import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { validateFile, FILE_TYPES } from '../../services/fileService.js'

const FileUpload = ({ 
  onFilesSelected, 
  maxFiles = 10, 
  disabled = false,
  acceptedFileTypes = Object.values(FILE_TYPES).flatMap(type => type.mimeTypes),
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setValidationErrors([])
    
    // Validate accepted files
    const validatedFiles = []
    const errors = []

    acceptedFiles.forEach((file, index) => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validatedFiles.push({
          file,
          id: `${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: validation.fileType,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`)
      }
    })

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      const errorMessages = fileErrors.map(error => {
        switch (error.code) {
          case 'file-too-large':
            return 'File is too large'
          case 'file-invalid-type':
            return 'File type not supported'
          case 'too-many-files':
            return 'Too many files selected'
          default:
            return error.message
        }
      })
      errors.push(`${file.name}: ${errorMessages.join(', ')}`)
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
    }

    if (validatedFiles.length > 0) {
      onFilesSelected(validatedFiles)
    }
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    disabled,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {}),
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const formatFileTypes = () => {
    const allExtensions = Object.values(FILE_TYPES).flatMap(type => type.extensions)
    return allExtensions.join(', ').toUpperCase()
  }

  return (
    <div className={`file-upload-container ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive || dragActive 
            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-fuchsia-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive || dragActive
                ? 'Suelta los archivos aquí'
                : 'Arrastra archivos aquí o haz clic para seleccionar'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Máximo {maxFiles} archivos
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Formatos soportados: {formatFileTypes()}
            </p>
          </div>

          {/* File Size Limits */}
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <div>Imágenes: hasta 10MB</div>
            <div>Videos: hasta 100MB</div>
            <div>Documentos: hasta 25MB</div>
            <div>Audio: hasta 50MB</div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Errores de validación:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUpload