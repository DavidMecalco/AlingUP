/**
 * Image compression utilities for optimizing file uploads
 */

/**
 * Compress an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1080)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @param {string} options.outputFormat - Output format 'jpeg' or 'webp' (default: 'jpeg')
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'jpeg'
    } = options

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      resolve(file) // Return original file if not an image
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`),
              {
                type: `image/${outputFormat}`,
                lastModified: Date.now()
              }
            )

            resolve(compressedFile)
          },
          `image/${outputFormat}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'))
    }

    // Load image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Batch compress multiple image files
 * @param {File[]} files - Array of image files to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export const compressImages = async (files, options = {}) => {
  const compressionPromises = files.map(file => compressImage(file, options))
  return Promise.all(compressionPromises)
}

/**
 * Get image dimensions without loading the full image
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Check if image needs compression based on file size and dimensions
 * @param {File} file - Image file to check
 * @param {Object} thresholds - Size and dimension thresholds
 * @returns {Promise<boolean>} - True if compression is recommended
 */
export const shouldCompressImage = async (file, thresholds = {}) => {
  const {
    maxFileSize = 2 * 1024 * 1024, // 2MB
    maxWidth = 1920,
    maxHeight = 1080
  } = thresholds

  if (!file.type.startsWith('image/')) {
    return false
  }

  // Check file size
  if (file.size > maxFileSize) {
    return true
  }

  try {
    // Check dimensions
    const dimensions = await getImageDimensions(file)
    return dimensions.width > maxWidth || dimensions.height > maxHeight
  } catch (error) {
    console.warn('Could not determine image dimensions:', error)
    return false
  }
}

/**
 * Create a thumbnail from an image file
 * @param {File} file - Image file
 * @param {Object} options - Thumbnail options
 * @returns {Promise<File>} - Thumbnail file
 */
export const createThumbnail = (file, options = {}) => {
  const {
    width = 150,
    height = 150,
    quality = 0.7,
    format = 'jpeg'
  } = options

  return compressImage(file, {
    maxWidth: width,
    maxHeight: height,
    quality,
    outputFormat: format
  })
}

/**
 * Convert image to WebP format for better compression
 * @param {File} file - Image file to convert
 * @param {number} quality - WebP quality (0-1)
 * @returns {Promise<File>} - WebP file
 */
export const convertToWebP = (file, quality = 0.8) => {
  return compressImage(file, {
    outputFormat: 'webp',
    quality,
    maxWidth: 1920,
    maxHeight: 1080
  })
}

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @param {Object} constraints - Validation constraints
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
export const validateImageFile = async (file, constraints = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxWidth = 4000,
    maxHeight = 4000
  } = constraints

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
    }
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }

  try {
    // Check dimensions
    const dimensions = await getImageDimensions(file)
    
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        isValid: false,
        error: `Dimensiones demasiado grandes. Máximo: ${maxWidth}x${maxHeight}px`
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'No se pudo validar la imagen'
    }
  }
}