import React, { useState, useRef, useEffect } from 'react'

const AudioPlayer = ({ audioFiles, className = '' }) => {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      // Auto-play next track if available
      if (currentTrack < audioFiles.length - 1) {
        setCurrentTrack(prev => prev + 1)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrack, audioFiles.length])

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const selectTrack = (index) => {
    setCurrentTrack(index)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const nextTrack = () => {
    if (currentTrack < audioFiles.length - 1) {
      selectTrack(currentTrack + 1)
    }
  }

  const previousTrack = () => {
    if (currentTrack > 0) {
      selectTrack(currentTrack - 1)
    }
  }

  if (!audioFiles || audioFiles.length === 0) {
    return null
  }

  const currentAudio = audioFiles[currentTrack]
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={`audio-player bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentAudio.url_storage || currentAudio.publicUrl}
        preload="metadata"
      />

      {/* Track Info */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {currentAudio.nombre_archivo || `Nota de Voz ${currentTrack + 1}`}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentTrack + 1} de {audioFiles.length}
          {currentAudio.created_at && (
            <span className="ml-2">
              • {new Date(currentAudio.created_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          ref={progressRef}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-fuchsia-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Previous/Next Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={previousTrack}
            disabled={currentTrack === 0}
            className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Anterior"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-full flex items-center justify-center transition-colors"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            disabled={currentTrack === audioFiles.length - 1}
            className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Siguiente"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        {/* Volume Control */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400 transition-colors"
            title="Volumen"
          >
            {volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : volume < 0.5 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}
        </div>
      </div>

      {/* Track List (if multiple tracks) */}
      {audioFiles.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Lista de Reproducción
          </h5>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {audioFiles.map((audio, index) => (
              <button
                key={audio.id || index}
                onClick={() => selectTrack(index)}
                className={`
                  w-full text-left px-3 py-2 rounded text-sm transition-colors
                  ${index === currentTrack
                    ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center">
                  <span className="w-6 text-xs">{index + 1}.</span>
                  <span className="truncate">
                    {audio.nombre_archivo || `Nota de Voz ${index + 1}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioPlayer