import React, { useState, useRef } from 'react'

const VideoPlayer = ({ videos, className = '' }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState({})
  const videoRefs = useRef({})

  const handleVideoClick = (video, index) => {
    setSelectedVideo({ ...video, index })
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
  }

  const togglePlay = (videoId) => {
    const video = videoRefs.current[videoId]
    if (video) {
      if (video.paused) {
        video.play()
        setIsPlaying(prev => ({ ...prev, [videoId]: true }))
      } else {
        video.pause()
        setIsPlaying(prev => ({ ...prev, [videoId]: false }))
      }
    }
  }

  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getVideoThumbnail = (videoUrl) => {
    // For now, we'll use a placeholder. In a real app, you might generate thumbnails
    return null
  }

  if (!videos || videos.length === 0) {
    return null
  }

  return (
    <>
      {/* Video Grid */}
      <div className={`video-player-grid ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div
              key={video.id || index}
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <div className="aspect-video relative">
                <video
                  ref={el => videoRefs.current[video.id || index] = el}
                  src={video.url_storage || video.publicUrl}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    // Store duration for display
                    e.target.dataset.duration = e.target.duration
                  }}
                  onClick={() => handleVideoClick(video, index)}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay(video.id || index)
                    }}
                    className="w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110"
                  >
                    {isPlaying[video.id || index] ? (
                      <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    <p className="truncate font-medium">
                      {video.nombre_archivo || `Video ${index + 1}`}
                    </p>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => handleVideoClick(video, index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded transition-all duration-200"
                  title="Ver en pantalla completa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeVideoModal}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video Container */}
          <div className="w-full h-full max-w-6xl max-h-full p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <video
                src={selectedVideo.url_storage || selectedVideo.publicUrl}
                controls
                autoPlay
                className="max-w-full max-h-full"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
              />
            </div>

            {/* Video Info */}
            <div className="mt-4 text-center">
              <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg inline-block">
                <p className="text-sm font-medium">
                  {selectedVideo.nombre_archivo || 'Video'}
                </p>
                {videos.length > 1 && (
                  <p className="text-xs text-gray-300 mt-1">
                    {selectedVideo.index + 1} de {videos.length}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeVideoModal}
          />
        </div>
      )}
    </>
  )
}

export default VideoPlayer