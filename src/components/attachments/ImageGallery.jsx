import React, { useState, useEffect } from 'react'

const ImageGallery = ({ images, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      } else if (event.key === 'ArrowLeft') {
        navigatePrevious()
      } else if (event.key === 'ArrowRight') {
        navigateNext()
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateNext = () => {
    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length
      setCurrentIndex(nextIndex)
      setSelectedImage(images[nextIndex])
    }
  }

  const navigatePrevious = () => {
    if (images.length > 1) {
      const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      setSelectedImage(images[prevIndex])
    }
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`image-gallery ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-square"
              onClick={() => openLightbox(image, index)}
            >
              <img
                src={image.url_storage || image.publicUrl}
                alt={image.nombre_archivo || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {/* Image count badge for multiple images */}
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/{images.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={navigatePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Imagen anterior"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={navigateNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Siguiente imagen"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="max-w-full max-h-full p-4">
            <img
              src={selectedImage.url_storage || selectedImage.publicUrl}
              alt={selectedImage.nombre_archivo || 'Image'}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg inline-block">
              <p className="text-sm font-medium">
                {selectedImage.nombre_archivo || 'Imagen'}
              </p>
              {images.length > 1 && (
                <p className="text-xs text-gray-300 mt-1">
                  {currentIndex + 1} de {images.length}
                </p>
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeLightbox}
          />
        </div>
      )}
    </>
  )
}

export default ImageGallery