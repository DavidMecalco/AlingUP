import { supabase } from './supabaseClient.js'

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  VIDEO: {
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/webm']
  },
  DOCUMENT: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    maxSize: 25 * 1024 * 1024, // 25MB
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
  },
  AUDIO: {
    extensions: ['mp3', 'wav', 'ogg', 'm4a', 'webm'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
  }
}

// Validate file type and size
export const validateFile = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('No file provided')
    return { isValid: false, errors }
  }

  // Get file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  // Determine file type category
  let fileTypeCategory = null
  let maxSize = 0
  let allowedMimeTypes = []

  for (const [category, config] of Object.entries(FILE_TYPES)) {
    if (config.extensions.includes(extension) || config.mimeTypes.includes(file.type)) {
      fileTypeCategory = category.toLowerCase()
      maxSize = config.maxSize
      allowedMimeTypes = config.mimeTypes
      break
    }
  }

  if (!fileTypeCategory) {
    errors.push(`File type not supported. Allowed types: ${Object.values(FILE_TYPES).flatMap(t => t.extensions).join(', ')}`)
  }

  // Validate file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds limit. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`)
  }

  // Validate MIME type
  if (fileTypeCategory && !allowedMimeTypes.includes(file.type)) {
    errors.push(`Invalid file format for ${fileTypeCategory}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileType: fileTypeCategory
  }
}

// Generate unique file name
export const generateFileName = (originalName, ticketId) => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const baseName = originalName.split('.').slice(0, -1).join('.')
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_')
  
  return `${ticketId}/${timestamp}_${sanitizedName}.${extension}`
}

// Upload file to Supabase Storage
export const uploadFile = async (file, ticketId, onProgress = null) => {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    // Generate unique file name
    const fileName = generateFileName(file.name, ticketId)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName)

    return {
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: validation.fileType,
        mimeType: file.type
      }
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Upload multiple files
export const uploadMultipleFiles = async (files, ticketId, onProgress = null) => {
  const results = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      const result = await uploadFile(file, ticketId, (progress) => {
        if (onProgress) {
          onProgress({
            fileIndex: i,
            fileName: file.name,
            progress,
            totalFiles: files.length
          })
        }
      })
      
      results.push({
        file: file.name,
        ...result
      })
    } catch (error) {
      results.push({
        file: file.name,
        success: false,
        error: error.message
      })
    }
  }
  
  return results
}

// Delete file from storage
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('ticket-attachments')
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('File delete error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get file download URL
export const getFileDownloadUrl = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      throw new Error(`Failed to get download URL: ${error.message}`)
    }

    return {
      success: true,
      url: data.signedUrl
    }
  } catch (error) {
    console.error('Get download URL error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Create attachment record in database
export const createAttachmentRecord = async (attachmentData) => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        ticket_id: attachmentData.ticketId,
        tipo: attachmentData.fileType,
        url_storage: attachmentData.publicUrl,
        nombre_archivo: attachmentData.fileName,
        uploaded_by: attachmentData.uploadedBy
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create attachment record: ${error.message}`)
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Create attachment record error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get attachments for a ticket
export const getTicketAttachments = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch attachments: ${error.message}`)
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Get attachments error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  validateFile,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileDownloadUrl,
  createAttachmentRecord,
  getTicketAttachments,
  FILE_TYPES
}