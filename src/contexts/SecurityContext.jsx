/**
 * Security Context Provider
 * Provides security services and state management throughout the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import securityService from '../services/securityService.js'
import { DEFAULT_SECURITY_CONFIG } from '../config/security.js'

const SecurityContext = createContext(null)

/**
 * Security Context Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.config - Security configuration override
 * @returns {React.ReactElement} - Provider component
 */
export const SecurityProvider = ({ children, config = {} }) => {
  const [securityState, setSecurityState] = useState({
    isInitialized: false,
    globalSecurityLevel: 'normal', // normal, elevated, high
    activeThreats: [],
    securityEvents: [],
    rateLimitStatus: {},
    suspiciousActivities: new Map(),
    securityMetrics: {
      totalEvents: 0,
      threatsBlocked: 0,
      rateLimitsTriggered: 0,
      filesScanned: 0,
      maliciousFilesBlocked: 0
    }
  })

  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }

  // Initialize security service
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Set up security event listener
        const handleSecurityEvent = (event) => {
          setSecurityState(prev => {
            const newEvents = [...prev.securityEvents.slice(-99), event] // Keep last 100 events
            const newMetrics = { ...prev.securityMetrics }
            
            // Update metrics based on event type
            newMetrics.totalEvents += 1
            
            switch (event.type) {
              case 'rate_limit_exceeded':
                newMetrics.rateLimitsTriggered += 1
                break
              case 'malicious_file_detected':
                newMetrics.maliciousFilesBlocked += 1
                break
              case 'file_upload_success':
                newMetrics.filesScanned += 1
                break
              case 'suspicious_activity_detected':
                newMetrics.threatsBlocked += 1
                break
            }

            // Determine security level based on recent events
            const recentEvents = newEvents.filter(e => 
              Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
            )
            
            let securityLevel = 'normal'
            if (recentEvents.length > 10) {
              securityLevel = 'elevated'
            }
            if (recentEvents.length > 20) {
              securityLevel = 'high'
            }

            return {
              ...prev,
              securityEvents: newEvents,
              securityMetrics: newMetrics,
              globalSecurityLevel: securityLevel
            }
          })
        }

        securityService.addSecurityEventListener(handleSecurityEvent)

        // Apply Content Security Policy
        if (securityConfig.csp && typeof document !== 'undefined') {
          const cspHeader = securityService.generateCSPHeader()
          const metaTag = document.createElement('meta')
          metaTag.httpEquiv = 'Content-Security-Policy'
          metaTag.content = cspHeader
          document.head.appendChild(metaTag)
        }

        setSecurityState(prev => ({
          ...prev,
          isInitialized: true
        }))

        console.log('Security service initialized')
      } catch (error) {
        console.error('Failed to initialize security service:', error)
      }
    }

    initializeSecurity()

    // Cleanup on unmount
    return () => {
      // Remove event listeners and cleanup
    }
  }, [securityConfig])

  /**
   * Check if user can perform an action based on security level
   * @param {string} action - Action to check
   * @param {Object} context - Action context
   * @returns {boolean} - True if action is allowed
   */
  const canPerformAction = useCallback((action, context = {}) => {
    const { securityLevel = 'normal' } = context
    
    // High security level restrictions
    if (securityState.globalSecurityLevel === 'high') {
      const restrictedActions = ['file_upload', 'bulk_operations', 'admin_actions']
      if (restrictedActions.includes(action)) {
        return false
      }
    }

    // Elevated security level restrictions
    if (securityState.globalSecurityLevel === 'elevated') {
      const restrictedActions = ['bulk_operations', 'admin_actions']
      if (restrictedActions.includes(action)) {
        return false
      }
    }

    return true
  }, [securityState.globalSecurityLevel])

  /**
   * Report a security incident
   * @param {string} type - Incident type
   * @param {Object} details - Incident details
   */
  const reportSecurityIncident = useCallback((type, details = {}) => {
    const incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      details,
      timestamp: new Date().toISOString(),
      severity: details.severity || 'medium',
      resolved: false
    }

    setSecurityState(prev => ({
      ...prev,
      activeThreats: [...prev.activeThreats, incident]
    }))

    // Log the incident
    securityService.logSecurityEvent('security_incident_reported', {
      incidentId: incident.id,
      type,
      details
    })

    // Auto-resolve low severity incidents after 5 minutes
    if (incident.severity === 'low') {
      setTimeout(() => {
        resolveSecurityIncident(incident.id)
      }, 5 * 60 * 1000)
    }
  }, [])

  /**
   * Resolve a security incident
   * @param {string} incidentId - Incident ID to resolve
   */
  const resolveSecurityIncident = useCallback((incidentId) => {
    setSecurityState(prev => ({
      ...prev,
      activeThreats: prev.activeThreats.map(threat =>
        threat.id === incidentId ? { ...threat, resolved: true } : threat
      )
    }))

    securityService.logSecurityEvent('security_incident_resolved', {
      incidentId
    })
  }, [])

  /**
   * Get security recommendations based on current state
   * @returns {Array} - Array of security recommendations
   */
  const getSecurityRecommendations = useCallback(() => {
    const recommendations = []

    // Check for high rate limit triggers
    if (securityState.securityMetrics.rateLimitsTriggered > 10) {
      recommendations.push({
        type: 'rate_limits',
        severity: 'medium',
        message: 'High number of rate limit triggers detected. Consider reviewing user behavior.',
        action: 'Review rate limit policies'
      })
    }

    // Check for malicious file uploads
    if (securityState.securityMetrics.maliciousFilesBlocked > 0) {
      recommendations.push({
        type: 'file_security',
        severity: 'high',
        message: 'Malicious files have been blocked. Review file upload policies.',
        action: 'Strengthen file validation rules'
      })
    }

    // Check security level
    if (securityState.globalSecurityLevel === 'high') {
      recommendations.push({
        type: 'security_level',
        severity: 'high',
        message: 'Security level is currently HIGH. Some features may be restricted.',
        action: 'Monitor security events and consider additional measures'
      })
    }

    // Check for unresolved threats
    const unresolvedThreats = securityState.activeThreats.filter(t => !t.resolved)
    if (unresolvedThreats.length > 0) {
      recommendations.push({
        type: 'active_threats',
        severity: 'high',
        message: `${unresolvedThreats.length} unresolved security threats detected.`,
        action: 'Review and resolve active security incidents'
      })
    }

    return recommendations
  }, [securityState])

  /**
   * Update rate limit status for a user/operation
   * @param {string} key - Rate limit key
   * @param {Object} status - Rate limit status
   */
  const updateRateLimitStatus = useCallback((key, status) => {
    setSecurityState(prev => ({
      ...prev,
      rateLimitStatus: {
        ...prev.rateLimitStatus,
        [key]: {
          ...status,
          lastUpdated: Date.now()
        }
      }
    }))
  }, [])

  /**
   * Clear old security data to prevent memory leaks
   */
  const cleanupSecurityData = useCallback(() => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    setSecurityState(prev => ({
      ...prev,
      securityEvents: prev.securityEvents.filter(event =>
        new Date(event.timestamp).getTime() > oneHourAgo
      ),
      activeThreats: prev.activeThreats.filter(threat =>
        !threat.resolved || new Date(threat.timestamp).getTime() > oneHourAgo
      ),
      rateLimitStatus: Object.fromEntries(
        Object.entries(prev.rateLimitStatus).filter(([_, status]) =>
          status.lastUpdated > oneHourAgo
        )
      )
    }))
  }, [])

  // Periodic cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupSecurityData, 10 * 60 * 1000) // Every 10 minutes
    return () => clearInterval(cleanupInterval)
  }, [cleanupSecurityData])

  /**
   * Get security dashboard data
   * @returns {Object} - Security dashboard data
   */
  const getSecurityDashboard = useCallback(() => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const recentEvents = securityState.securityEvents.filter(event =>
      new Date(event.timestamp).getTime() > oneHourAgo
    )

    const dailyEvents = securityState.securityEvents.filter(event =>
      new Date(event.timestamp).getTime() > oneDayAgo
    )

    const activeThreats = securityState.activeThreats.filter(t => !t.resolved)

    return {
      securityLevel: securityState.globalSecurityLevel,
      metrics: securityState.securityMetrics,
      recentEvents: recentEvents.length,
      dailyEvents: dailyEvents.length,
      activeThreats: activeThreats.length,
      recommendations: getSecurityRecommendations(),
      rateLimitedOperations: Object.keys(securityState.rateLimitStatus).length
    }
  }, [securityState, getSecurityRecommendations])

  const contextValue = {
    // State
    securityState,
    isInitialized: securityState.isInitialized,
    securityLevel: securityState.globalSecurityLevel,
    
    // Security service access
    securityService,
    
    // Actions
    canPerformAction,
    reportSecurityIncident,
    resolveSecurityIncident,
    updateRateLimitStatus,
    
    // Data access
    getSecurityRecommendations,
    getSecurityDashboard,
    
    // Configuration
    securityConfig
  }

  if (!securityState.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing security services...</p>
        </div>
      </div>
    )
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  )
}

/**
 * Hook to use security context
 * @returns {Object} - Security context value
 */
export const useSecurityContext = () => {
  const context = useContext(SecurityContext)
  
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider')
  }
  
  return context
}

/**
 * HOC to wrap components with security context
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} - Wrapped component
 */
export const withSecurity = (Component) => {
  return function SecurityWrappedComponent(props) {
    return (
      <SecurityProvider>
        <Component {...props} />
      </SecurityProvider>
    )
  }
}

export default SecurityContext