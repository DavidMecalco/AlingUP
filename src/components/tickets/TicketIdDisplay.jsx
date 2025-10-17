import React, { useState } from 'react'

const TicketIdDisplay = ({ 
  ticketNumber, 
  showCopyButton = true, 
  size = 'medium',
  className = '' 
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!ticketNumber) return
    
    try {
      await navigator.clipboard.writeText(ticketNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy ticket number:', err)
    }
  }

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  }

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  }

  if (!ticketNumber) {
    return (
      <div className={`inline-flex items-center gap-2 bg-gray-100 text-gray-500 rounded-md font-mono ${sizeClasses[size]} ${className}`}>
        <span className="animate-pulse">Generando ID...</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-md font-mono ${sizeClasses[size]} ${className}`}>
      {/* Ticket Icon */}
      <svg 
        className={`${iconSizes[size]} text-primary-600`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" 
        />
      </svg>
      
      {/* Ticket Number */}
      <span className="font-semibold select-all">
        {ticketNumber}
      </span>
      
      {/* Copy Button */}
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`${iconSizes[size]} text-primary-600 hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded`}
          title={copied ? 'Copiado!' : 'Copiar ID del ticket'}
        >
          {copied ? (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
      
      {/* Copy Feedback */}
      {copied && (
        <span className="text-xs text-green-600 font-medium animate-fade-in">
          ¡Copiado!
        </span>
      )}
    </div>
  )
}

export default TicketIdDisplay