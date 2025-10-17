import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import filterService from '../services/filterService'

/**
 * Custom hook for filter management with persistence
 * @param {Object} options - Filter options
 * @returns {Object} Filter state and methods
 */
export const useFilters = (options = {}) => {
  const {
    context = 'default',
    persistToURL = false,
    persistToLocalStorage = true,
    autoSave = true
  } = options

  const { user } = useAuth()
  
  // Filter state
  const [filters, setFilters] = useState({})
  const [savedFilters, setSavedFilters] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load saved filters and restore state on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedFilters()
      
      if (persistToLocalStorage) {
        const savedState = filterService.loadFilterState(user.id, context)
        if (savedState) {
          setFilters(savedState)
        }
      }
    }
  }, [user?.id, context, persistToLocalStorage])

  // Auto-save filter state when filters change
  useEffect(() => {
    if (autoSave && user?.id && persistToLocalStorage) {
      filterService.saveFilterState(filters, user.id, context)
    }
  }, [filters, autoSave, user?.id, persistToLocalStorage, context])

  /**
   * Load saved filters from server
   */
  const loadSavedFilters = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await filterService.getSavedFilters(user.id)
      if (error) {
        setError(error.message)
      } else {
        setSavedFilters(data || [])
      }
    } catch (error) {
      console.error('Error loading saved filters:', error)
      setError('Error al cargar filtros guardados')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    const validation = filterService.validateFilters(newFilters)
    
    if (validation.isValid) {
      setFilters(validation.validatedFilters)
      setError(null)
    } else {
      setError(validation.errors.join(', '))
    }
  }, [])

  /**
   * Apply a specific filter
   */
  const applyFilter = useCallback((filterKey, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters }
      
      if (value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0)) {
        delete newFilters[filterKey]
      } else {
        newFilters[filterKey] = value
      }
      
      return newFilters
    })
  }, [])

  /**
   * Toggle a filter value (for array filters)
   */
  const toggleFilter = useCallback((filterKey, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[filterKey] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      const newFilters = { ...prevFilters }
      if (newValues.length > 0) {
        newFilters[filterKey] = newValues
      } else {
        delete newFilters[filterKey]
      }
      
      return newFilters
    })
  }, [])

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({})
    setError(null)
  }, [])

  /**
   * Clear a specific filter
   */
  const clearFilter = useCallback((filterKey) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters }
      delete newFilters[filterKey]
      return newFilters
    })
  }, [])

  /**
   * Save current filters as favorite
   */
  const saveCurrentFilters = useCallback(async (name) => {
    if (!user?.id || !name.trim()) {
      throw new Error('Nombre requerido para guardar filtros')
    }

    if (Object.keys(filters).length === 0) {
      throw new Error('No hay filtros para guardar')
    }

    try {
      const { error } = await filterService.saveFavoriteFilter(name, filters, user.id)
      if (error) {
        throw new Error(error.message || 'Error al guardar filtros')
      }
      
      await loadSavedFilters()
      return true
    } catch (error) {
      console.error('Save filters error:', error)
      throw error
    }
  }, [filters, user?.id, loadSavedFilters])

  /**
   * Apply a saved filter
   */
  const applySavedFilter = useCallback((savedFilter) => {
    if (savedFilter && savedFilter.filters) {
      setFilters(savedFilter.filters)
    }
  }, [])

  /**
   * Delete a saved filter
   */
  const deleteSavedFilter = useCallback(async (filterId) => {
    if (!user?.id) return false

    try {
      const { error } = await filterService.deleteSavedFilter(filterId, user.id)
      if (!error) {
        await loadSavedFilters()
        return true
      }
      return false
    } catch (error) {
      console.error('Delete saved filter error:', error)
      return false
    }
  }, [user?.id, loadSavedFilters])

  /**
   * Apply a filter preset
   */
  const applyPreset = useCallback((presetId) => {
    const presets = filterService.getFilterPresets()
    const preset = presets.find(p => p.id === presetId)
    
    if (preset) {
      setFilters(preset.filters)
    }
  }, [])

  /**
   * Get URL parameters for current filters
   */
  const getURLParams = useCallback(() => {
    return filterService.filtersToURLParams(filters)
  }, [filters])

  /**
   * Apply filters from URL parameters
   */
  const applyFromURL = useCallback((searchParams) => {
    const urlFilters = filterService.filtersFromURLParams(searchParams)
    setFilters(urlFilters)
  }, [])

  /**
   * Check if a specific filter is active
   */
  const isFilterActive = useCallback((filterKey, value = null) => {
    const filterValue = filters[filterKey]
    
    if (value === null) {
      return filterValue !== undefined && filterValue !== null &&
             (!Array.isArray(filterValue) || filterValue.length > 0)
    }
    
    if (Array.isArray(filterValue)) {
      return filterValue.includes(value)
    }
    
    return filterValue === value
  }, [filters])

  /**
   * Get active filter count
   */
  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null
    }).length
  }, [filters])

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useCallback(() => {
    return getActiveFilterCount() > 0
  }, [getActiveFilterCount])

  /**
   * Get filter presets
   */
  const getPresets = useCallback(() => {
    return filterService.getFilterPresets()
  }, [])

  return {
    // State
    filters,
    savedFilters,
    isLoading,
    error,
    
    // Actions
    updateFilters,
    applyFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    saveCurrentFilters,
    applySavedFilter,
    deleteSavedFilter,
    applyPreset,
    applyFromURL,
    
    // Utilities
    getURLParams,
    isFilterActive,
    getActiveFilterCount,
    hasActiveFilters,
    getPresets,
    
    // Refresh
    loadSavedFilters
  }
}

export default useFilters