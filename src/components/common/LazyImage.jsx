import React, { useState, useRef, useEffect } from 'react'

/**
 * LazyImage component with intersection observer for performance optimization
 * Loads images only when they come into viewport
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const currentImg = imgRef.current

    if (!currentImg || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(currentImg)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [threshold, rootMargin])

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad(e)
  }

  const handleError = (e) => {
    setHasError(true)
    onError(e)
  }

  // Default placeholder component
  const DefaultPlaceholder = () => (
    <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )

  // Error placeholder component
  const ErrorPlaceholder = () => (
    <div className={`bg-red-100 border border-red-300 flex items-center justify-center ${className}`}>
      <svg
        className="w-8 h-8 text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )

  if (hasError) {
    return <ErrorPlaceholder />
  }

  return (
    <div ref={imgRef} className="relative">
      {!isLoaded && (placeholder || <DefaultPlaceholder />)}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage