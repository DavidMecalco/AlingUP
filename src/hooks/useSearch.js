import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import searchService from '../services/searchService'
import { useDebounce } from './useDebounce'

/**
 * Custom hook for search functionality
 * @param {Object} options - Search options
 * @returns {Object} Search state and methods
 */
export const useSearch = (options = {}) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 50,
    autoSaveHistory = true,
    includeHighlights = true
  } = options

  const { user } = useAuth()
  
  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [savedSearches, setSavedSearches] = useState([])

  const debouncedQuery = useDebounce(query, debounceMs)

  // Load user data on mount
  useEffect(() => {
    if (user?.id) {
      loadSearchHistory()
      loadSavedSearches()
    }
  }, [user?.id])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= minQueryLength) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
      setError(null)
    }
  }, [debouncedQuery, filters, minQueryLength])

  // Get suggestions for autocomplete
  useEffect(() => {
    if (query.trim().length >= minQueryLength && query.trim().length < 10) {
      getSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query, minQueryLength])

  /**
   * Load search history from server
   */
  const loadSearchHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await searchService.getSearchHistory(user.id)
      if (!error) {
        setSearchHistory(data || [])
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }, [user?.id])

  /**
   * Load saved searches from server
   */
  const loadSavedSearches = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await searchService.getSavedSearches(user.id)
      if (!error) {
        setSavedSearches(data || [])
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    }
  }, [user?.id])

  /**
   * Perform search with current query and filters
   */
  const performSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery || searchQuery.trim().length < minQueryLength) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await searchService.globalSearch(searchQuery, {
        filters,
        includeHighlights,
        limit: maxResults
      })

      if (error) {
        setError(error.message || 'Error en la búsqueda')
        setResults([])
      } else {
        setResults(data || [])
        
        // Save to search history if enabled
        if (autoSaveHistory && user?.id && searchQuery.trim().length >= minQueryLength) {
          await searchService.saveSearchHistory(searchQuery, user.id)
          loadSearchHistory()
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Error al realizar la búsqueda')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, includeHighlights, maxResults, autoSaveHistory, user?.id, minQueryLength, loadSearchHistory])

  /**
   * Get search suggestions
   */
  const getSuggestions = useCallback(async (partialQuery) => {
    try {
      const { data, error } = await searchService.getSearchSuggestions(partialQuery)
      if (!error && data) {
        setSuggestions(data)
      }
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }, [])

  /**
   * Save current search as favorite
   */
  const saveCurrentSearch = useCallback(async (name) => {
    if (!query.trim() || !user?.id || !name.trim()) {
      throw new Error('Datos insuficientes para guardar la búsqueda')
    }

    try {
      const { error } = await searchService.saveFavoriteSearch(
        query,
        name,
        user.id,
        filters
      )

      if (error) {
        throw new Error(error.message || 'Error al guardar la búsqueda')
      }

      await loadSavedSearches()
      return true
    } catch (error) {
      console.error('Save search error:', error)
      throw error
    }
  }, [query, user?.id, filters, loadSavedSearches])

  /**
   * Delete a saved search
   */
  const deleteSavedSearch = useCallback(async (searchId) => {
    if (!user?.id || !searchId) return

    try {
      const { error } = await searchService.deleteSavedSearch(searchId, user.id)
      if (!error) {
        await loadSavedSearches()
      }
      return !error
    } catch (error) {
      console.error('Delete saved search error:', error)
      return false
    }
  }, [user?.id, loadSavedSearches])

  /**
   * Apply a saved search
   */
  const applySavedSearch = useCallback((savedSearch) => {
    setQuery(savedSearch.query)
    setFilters(savedSearch.filters || {})
    // The search will be triggered by the useEffect watching debouncedQuery
  }, [])

  /**
   * Apply a search from history
   */
  const applyHistorySearch = useCallback((historyItem) => {
    setQuery(historyItem.query)
    // The search will be triggered by the useEffect watching debouncedQuery
  }, [])

  /**
   * Clear search results and query
   */
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
    setSuggestions([])
  }, [])

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
  }, [])

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    // State
    query,
    results,
    isLoading,
    error,
    filters,
    suggestions,
    searchHistory,
    savedSearches,
    
    // Actions
    setQuery,
    performSearch,
    saveCurrentSearch,
    deleteSavedSearch,
    applySavedSearch,
    applyHistorySearch,
    clearSearch,
    updateFilters,
    resetFilters,
    
    // Refresh functions
    loadSearchHistory,
    loadSavedSearches,
    
    // Computed values
    hasResults: results.length > 0,
    hasQuery: query.trim().length >= minQueryLength,
    canSaveSearch: query.trim().length >= minQueryLength && user?.id
  }
}

export default useSearch