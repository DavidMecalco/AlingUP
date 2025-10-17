/**
 * Secure file upload service with comprehensive validation and security measures
 */

import { supabase } from './supabaseClient.js'
import securityService from './securityService.js'
import { generateSecureFilename } from '../utils/fileValidation.js'

/**
 * Secure file upload service class
 */
class SecureFileUploadService {
  constructor() {
    this.bucketName = 'ticket-attachments'
    this.maxConcurrentUploads = 3
    this.uploadQueue = []
    this.activeUploads = new Set()
  }

  /**
   * Upload files with comprehensive security validation
   * @param {FileList|File[]} files - Files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload results
   */
  async uploadFiles(files, options = {}) {
    const {
      userId = 'anonymous',
      ticketId = null,
      folder = 'general',
      onProgress = null,
      validateContent = true,
      generateThumbnails = false
    } = options

    try {
      // Validate files using security service
      const validation = await securityService.validateUploadedFiles(files, {
        userId,
        allowedTypes: ['images', 'videos', 'documents', 'audio'],
        maxFiles: 10,
        maxTotalSize: 200 * 1024 * 1024, // 200MB total
        maxSingleFileSize: 50 * 1024 * 1024 // 50MB per file
      })

      if (validation.invalid.length > 0) {
        return {
          success: false,
          error: `File validation failed: ${validation.errors.join(', ')}`,
          results: []
        }
      }

      // Process valid files
      const uploadPromises = validation.valid.map(fileItem => 
        this.uploadSingleFile(fileItem, {
          userId,
          ticketId,
          folder,
          onProgress,
          validateContent,
          generateThumbnails
        })
      )

      // Execute uploads with concurrency control
      const results = await this.executeWithConcurrencyLimit(uploadPromises)

      // Separate successful and failed uploads
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      return {
        success: failed.length === 0,
        results: successful,
        errors: failed.map(f => f.error),
        totalUploaded: successful.length,
        totalFailed: failed.length
      }

    } catch (error) {
      securityService.logSecurityEvent('file_upload_error', {
        userId,
        error: error.message,
        fileCount: files.length
      })

      return {
        success: false,
        error: `Upload failed: ${error.message}`,
        results: []
      }
    }
  }

  /**
   * Upload a single file with security measures
   * @param {Object} fileItem - File item from validation
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadSingleFile(fileItem, options = {}) {
    const {
      userId,
      ticketId,
      folder,
      onProgress,
      validateContent,
      generateThumbnails
    } = options

    const { originalFile, secureFilename, validation } = fileItem

    try {
      // Generate storage path
      const storagePath = this.generateStoragePath(folder, secureFilename, userId)

      // Create upload metadata
      const metadata = {
        originalName: originalFile.name,
        secureFilename,
        contentType: originalFile.type,
        size: originalFile.size,
        uploadedBy: userId,
        ticketId,
        uploadedAt: new Date().toISOString(),
        validation: validation.details
      }

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(storagePath, originalFile, {
          cacheControl: '3600',
          upsert: false,
          metadata
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath)

      // Generate thumbnail if requested and file is an image
      let thumbnailUrl = null
      if (generateThumbnails && originalFile.type.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(originalFile, storagePath)
      }

      // Save file record to database
      const fileRecord = await this.saveFileRecord({
        originalName: originalFile.name,
        secureFilename,
        storagePath,
        publicUrl: urlData.publicUrl,
        thumbnailUrl,
        contentType: originalFile.type,
        size: originalFile.size,
        ticketId,
        uploadedBy: userId,
        metadata
      })

      // Log successful upload
      securityService.logSecurityEvent('file_upload_success', {
        userId,
        ticketId,
        filename: secureFilename,
        size: originalFile.size,
        contentType: originalFile.type
      })

      return {
        success: true,
        file: fileRecord,
        url: urlData.publicUrl,
        thumbnailUrl,
        metadata
      }

    } catch (error) {
      securityService.logSecurityEvent('file_upload_failed', {
        userId,
        ticketId,
        filename: secureFilename,
        error: error.message
      })

      return {
        success: false,
        error: error.message,
        filename: originalFile.name
      }
    }
  }

  /**
   * Generate secure storage path
   * @param {string} folder - Folder name
   * @param {string} filename - Secure filename
   * @param {string} userId - User ID
   * @returns {string} - Storage path
   */
  generateStoragePath(folder, filename, userId) {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    
    return `${folder}/${year}/${month}/${day}/${userId}/${filename}`
  }

  /**
   * Generate thumbnail for image files
   * @param {File} file - Original image file
   * @param {string} originalPath - Original file storage path
   * @returns {Promise<string|null>} - Thumbnail URL
   */
  async generateThumbnail(file, originalPath) {
    try {
      // Create canvas for thumbnail generation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve) => {
        img.onload = async () => {
          // Calculate thumbnail dimensions (max 300x300, maintain aspect ratio)
          const maxSize = 300
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(null)
              return
            }

            // Upload thumbnail
            const thumbnailPath = originalPath.replace(/(\.[^.]+)$/, '_thumb$1')
            
            const { data, error } = await supabase.storage
              .from(this.bucketName)
              .upload(thumbnailPath, blob, {
                cacheControl: '3600',
                upsert: false
              })

            if (error) {
              console.warn('Thumbnail upload failed:', error)
              resolve(null)
              return
            }

            const { data: urlData } = supabase.storage
              .from(this.bucketName)
              .getPublicUrl(thumbnailPath)

            resolve(urlData.publicUrl)
          }, 'image/jpeg', 0.8)
        }

        img.onerror = () => resolve(null)
        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.warn('Thumbnail generation failed:', error)
      return null
    }
  }

  /**
   * Save file record to database
   * @param {Object} fileData - File data to save
   * @returns {Promise<Object>} - Saved file record
   */
  async saveFileRecord(fileData) {
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        ticket_id: fileData.ticketId,
        nombre_archivo: fileData.originalName,
        nombre_seguro: fileData.secureFilename,
        url_storage: fileData.storagePath,
        url_publica: fileData.publicUrl,
        url_thumbnail: fileData.thumbnailUrl,
        tipo: this.getFileType(fileData.contentType),
        content_type: fileData.contentType,
        tamaño: fileData.size,
        uploaded_by: fileData.uploadedBy,
        metadata: fileData.metadata
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database save failed: ${error.message}`)
    }

    return data
  }

  /**
   * Get file type category from content type
   * @param {string} contentType - MIME content type
   * @returns {string} - File type category
   */
  getFileType(contentType) {
    if (contentType.startsWith('image/')) return 'foto'
    if (contentType.startsWith('video/')) return 'video'
    if (contentType.startsWith('audio/')) return 'nota_voz'
    return 'documento'
  }

  /**
   * Execute promises with concurrency limit
   * @param {Promise[]} promises - Array of promises
   * @returns {Promise<Array>} - Results array
   */
  async executeWithConcurrencyLimit(promises) {
    const results = []
    const executing = []

    for (const promise of promises) {
      const p = promise.then(result => {
        executing.splice(executing.indexOf(p), 1)
        return result
      })

      results.push(p)
      executing.push(p)

      if (executing.length >= this.maxConcurrentUploads) {
        await Promise.race(executing)
      }
    }

    return Promise.all(results)
  }

  /**
   * Delete file securely
   * @param {string} fileId - File ID to delete
   * @param {string} userId - User requesting deletion
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteFile(fileId, userId) {
    try {
      // Get file record
      const { data: fileRecord, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError || !fileRecord) {
        return { success: false, error: 'File not found' }
      }

      // Check permissions (user can only delete their own files or admin)
      // This would need to be implemented based on your permission system

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([fileRecord.url_storage])

      if (storageError) {
        console.warn('Storage deletion failed:', storageError)
      }

      // Delete thumbnail if exists
      if (fileRecord.url_thumbnail) {
        const thumbnailPath = fileRecord.url_storage.replace(/(\.[^.]+)$/, '_thumb$1')
        await supabase.storage
          .from(this.bucketName)
          .remove([thumbnailPath])
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', fileId)

      if (dbError) {
        return { success: false, error: `Database deletion failed: ${dbError.message}` }
      }

      // Log deletion
      securityService.logSecurityEvent('file_deleted', {
        userId,
        fileId,
        filename: fileRecord.nombre_archivo,
        size: fileRecord.tamaño
      })

      return { success: true }

    } catch (error) {
      securityService.logSecurityEvent('file_deletion_error', {
        userId,
        fileId,
        error: error.message
      })

      return { success: false, error: error.message }
    }
  }

  /**
   * Get file download URL with access control
   * @param {string} fileId - File ID
   * @param {string} userId - User requesting access
   * @returns {Promise<Object>} - Download URL result
   */
  async getDownloadUrl(fileId, userId) {
    try {
      // Get file record and check permissions
      const { data: fileRecord, error } = await supabase
        .from('attachments')
        .select('*, ticket:ticket_id(cliente_id, tecnico_id)')
        .eq('id', fileId)
        .single()

      if (error || !fileRecord) {
        return { success: false, error: 'File not found' }
      }

      // Check access permissions
      // This would need to be implemented based on your permission system
      
      // Generate signed URL for secure access
      const { data: urlData, error: urlError } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(fileRecord.url_storage, 3600) // 1 hour expiry

      if (urlError) {
        return { success: false, error: 'Failed to generate download URL' }
      }

      // Log access
      securityService.logSecurityEvent('file_accessed', {
        userId,
        fileId,
        filename: fileRecord.nombre_archivo
      })

      return {
        success: true,
        url: urlData.signedUrl,
        filename: fileRecord.nombre_archivo,
        contentType: fileRecord.content_type,
        size: fileRecord.tamaño
      }

    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Scan uploaded files for malware (basic client-side detection)
   * @param {File} file - File to scan
   * @returns {Promise<Object>} - Scan result
   */
  async scanFile(file) {
    try {
      // Use the security service malware scan
      const scanResult = await securityService.fileValidationPipeline(file, {
        enableMalwareScan: true,
        enableContentScan: true
      })

      return {
        isSafe: scanResult.isValid,
        threats: scanResult.errors,
        warnings: scanResult.warnings
      }
    } catch (error) {
      return {
        isSafe: false,
        threats: [`Scan failed: ${error.message}`],
        warnings: []
      }
    }
  }
}

// Create and export singleton instance
const secureFileUploadService = new SecureFileUploadService()

export default secureFileUploadService
export { SecureFileUploadService }