import React, { useState, useRef } from 'react'
import { useMediaRecorder } from '../../hooks/useMediaRecorder.js'

const VoiceRecorder = ({ onRecordingComplete, onRecordingCancel, className = '' }) => {
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    formatTime
  } = useMediaRecorder()

  // Create audio URL when blob is available
  React.useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [audioBlob])

  const handleStartRecording = async () => {
    clearRecording()
    setAudioUrl(null)
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleSaveRecording = () => {
    if (audioBlob && onRecordingComplete) {
      // Create a File object from the blob
      const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, {
        type: 'audio/webm;codecs=opus'
      })
      
      onRecordingComplete(audioFile)
      clearRecording()
      setAudioUrl(null)
    }
  }

  const handleCancelRecording = () => {
    clearRecording()
    setAudioUrl(null)
    if (onRecordingCancel) {
      onRecordingCancel()
    }
  }

  const getRecordingState = () => {
    if (isRecording && !isPaused) return 'recording'
    if (isRecording && isPaused) return 'paused'
    if (audioBlob) return 'recorded'
    return 'idle'
  }

  const state = getRecordingState()

  return (
    <div className={`voice-recorder bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Nota de Voz
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="space-y-4">
        {/* Main Control Button */}
        <div className="flex justify-center">
          {state === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="w-16 h-16 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              title="Iniciar grabación"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <path d="M12 18v4"/>
                <path d="M8 22h8"/>
              </svg>
            </button>
          )}

          {(state === 'recording' || state === 'paused') && (
            <div className="flex items-center space-x-4">
              {/* Pause/Resume Button */}
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors"
                title={isPaused ? 'Reanudar' : 'Pausar'}
              >
                {isPaused ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                )}
              </button>

              {/* Recording Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isPaused ? 'Pausado' : 'Grabando...'}
                </span>
              </div>

              {/* Stop Button */}
              <button
                onClick={handleStopRecording}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Detener grabación"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        {state === 'recorded' && audioUrl && (
          <div className="space-y-4">
            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />

            {/* Playback Button */}
            <div className="flex justify-center">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleCancelRecording}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRecording}
                className="px-4 py-2 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-colors"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        )}

        {/* Recording Instructions */}
        {state === 'idle' && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Haz clic en el micrófono para comenzar a grabar
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Asegúrate de permitir el acceso al micrófono
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceRecorder