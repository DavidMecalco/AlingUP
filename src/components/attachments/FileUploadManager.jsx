import React, { useState, useCallback } from 'react'
import FileUpload from './FileUpload.jsx'
import FileUploadProgress from './FileUploadProgress.jsx'
import { uploadFile, createAttachmentRecord } from '../../services/fileService.js'
import { useAuth } from '../../contexts/AuthContext.jsx'

const FileUploadManager = ({ 
  ticketId, 
  onUploadComplete, 
  onUploadError,
  maxFiles = 10,
  disabled = false,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()

  const handleFilesSelected = useCallback((newFiles) => {
    const updatedFiles = newFiles.map(fileItem => ({
      ...fileItem,
      status: 'pending',
      progress: 0,
      error: null
    }))
    
    setSelectedFiles(prev => [...prev, ...updatedFiles])
  }, [])

  const handleRemoveFile = useCallback((fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  const handleClearAll = useCallback(() => {
    // Clean up preview URLs to prevent memory leaks
    selectedFiles.forEach(fileItem => {
      if (fileItem.preview) {
        URL.revokeObjectURL(fileItem.preview)
      }
    })
    setSelectedFiles([])
  }, [selectedFiles])

  const updateFileStatus = useCallback((fileId, updates) => {
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    )
  }, [])

  const uploadSingleFile = async (fileItem) => {
    if (!ticketId || !user) {
      throw new Error('Ticket ID and user are required for upload')
    }

    updateFileStatus(fileItem.id, { status: 'uploading', progress: 0 })

    try {
      // Simulate progress updates (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        updateFileStatus(fileItem.id, prevFile => ({
          progress: Math.min((prevFile.progress || 0) + Math.random() * 20, 90)
        }))
      }, 200)

      // Upload file to storage
      const uploadResult = await uploadFile(fileItem.file, ticketId)
      
      clearInterval(progressInterval)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      // Create attachment record in database
      const attachmentResult = await createAttachmentRecord({
        ticketId,
        fileType: uploadResult.data.fileType,
        publicUrl: uploadResult.data.publicUrl,
        fileName: uploadResult.data.fileName,
        uploadedBy: user.id
      })

      if (!attachmentResult.success) {
        throw new Error(attachmentResult.error)
      }

      updateFileStatus(fileItem.id, { 
        status: 'success', 
        progress: 100,
        attachmentId: attachmentResult.data.id,
        publicUrl: uploadResult.data.publicUrl
      })

      return {
        success: true,
        data: {
          ...uploadResult.data,
          attachmentId: attachmentResult.data.id
        }
      }
    } catch (error) {
      updateFileStatus(fileItem.id, { 
        status: 'error', 
        progress: 0,
        error: error.message 
      })
      
      return {
        success: false,
        error: error.message,
        fileName: fileItem.name
      }
    }
  }

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    const results = []

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const fileItem of selectedFiles) {
        if (fileItem.status === 'pending') {
          const result = await uploadSingleFile(fileItem)
          results.push(result)
        }
      }

      const successfulUploads = results.filter(r => r.success)
      const failedUploads = results.filter(r => !r.success)

      if (successfulUploads.length > 0 && onUploadComplete) {
        onUploadComplete(successfulUploads)
      }

      if (failedUploads.length > 0 && onUploadError) {
        onUploadError(failedUploads)
      }

      // Auto-clear successful uploads after a delay
      setTimeout(() => {
        setSelectedFiles(prev => 
          prev.filter(file => file.status !== 'success')
        )
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      if (onUploadError) {
        onUploadError([{ success: false, error: error.message }])
      }
    } finally {
      setIsUploading(false)
    }
  }

  const canUpload = selectedFiles.some(file => file.status === 'pending') && !isUploading
  const hasFiles = selectedFiles.length > 0

  return (
    <div className={`file-upload-manager ${className}`}>
      <FileUpload
        onFilesSelected={handleFilesSelected}
        maxFiles={maxFiles}
        disabled={disabled || isUploading}
      />

      {hasFiles && (
        <FileUploadProgress
          files={selectedFiles}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
        />
      )}

      {canUpload && (
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUploadAll}
            className="px-4 py-2 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : `Subir ${selectedFiles.filter(f => f.status === 'pending').length} archivo(s)`}
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploadManager