import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import searchService from '../../services/searchService'
import SearchResults from './SearchResults'
import SearchHistory from './SearchHistory'
import SavedSearches from './SavedSearches'

const GlobalSearch = ({ 
  onResultSelect,
  showFilters = true,
  placeholder = "Buscar tickets por título, descripción o ID...",
  className = ""
}) => {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('results') // 'results', 'history', 'saved'
  const [searchHistory, setSearchHistory] = useState([])
  const [savedSearches, setSavedSearches] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState({})
  const [error, setError] = useState(null)

  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  // Load search history and saved searches on mount
  useEffect(() => {
    if (user?.id) {
      loadSearchHistory()
      loadSavedSearches()
    }
  }, [user?.id])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery)
      setActiveTab('results')
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [debouncedQuery, filters])

  // Get suggestions for autocomplete
  useEffect(() => {
    if (query.trim().length >= 2 && query.trim().length < 10) {
      getSuggestions(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  // Handle clicks outside to close expanded view
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await searchService.getSearchHistory(user.id)
      if (error) {
        console.error('Error loading search history:', error)
      } else {
        setSearchHistory(data)
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }

  const loadSavedSearches = async () => {
    try {
      const { data, error } = await searchService.getSavedSearches(user.id)
      if (error) {
        console.error('Error loading saved searches:', error)
      } else {
        setSavedSearches(data)
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    }
  }

  const performSearch = async (searchQuery) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await searchService.globalSearch(searchQuery, {
        filters,
        includeHighlights: true,
        limit: 50
      })

      if (error) {
        setError(error.message)
        setResults([])
      } else {
        setResults(data)
        
        // Save to search history
        if (user?.id && searchQuery.trim().length >= 2) {
          await searchService.saveSearchHistory(searchQuery, user.id)
          loadSearchHistory() // Refresh history
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Error al realizar la búsqueda')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestions = async (partialQuery) => {
    try {
      const { data, error } = await searchService.getSearchSuggestions(partialQuery)
      if (!error && data) {
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      }
    } catch (error) {
      console.error('Suggestions error:', error)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim().length >= 2) {
      setIsExpanded(true)
    }
  }

  const handleInputFocus = () => {
    setIsExpanded(true)
    if (query.trim().length === 0) {
      setActiveTab('history')
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value)
    setShowSuggestions(false)
    performSearch(suggestion.value)
  }

  const handleHistoryItemClick = (historyItem) => {
    setQuery(historyItem.query)
    performSearch(historyItem.query)
    setActiveTab('results')
  }

  const handleSavedSearchClick = (savedSearch) => {
    setQuery(savedSearch.query)
    setFilters(savedSearch.filters || {})
    performSearch(savedSearch.query)
    setActiveTab('results')
  }

  const handleSaveCurrentSearch = async (name) => {
    if (!query.trim() || !user?.id) return

    try {
      const { error } = await searchService.saveFavoriteSearch(
        query,
        name,
        user.id,
        filters
      )

      if (error) {
        setError('Error al guardar la búsqueda')
      } else {
        loadSavedSearches() // Refresh saved searches
      }
    } catch (error) {
      console.error('Save search error:', error)
      setError('Error al guardar la búsqueda')
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setIsExpanded(false)
    setShowSuggestions(false)
    setError(null)
  }

  const handleResultClick = (ticket) => {
    if (onResultSelect) {
      onResultSelect(ticket)
    }
    setIsExpanded(false)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="input-field pl-10 pr-10"
          placeholder={placeholder}
          aria-label="Búsqueda global"
        />
        
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150"
            aria-label="Limpiar búsqueda"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500">{suggestion.subtitle}</div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Search Results */}
      {isExpanded && (
        <div 
          ref={resultsRef}
          className="absolute z-40 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'results'
                  ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resultados {results.length > 0 && `(${results.length})`}
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'history'
                  ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Historial
            </button>
            
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'saved'
                  ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Guardadas
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-80 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {activeTab === 'results' && (
              <SearchResults
                results={results}
                isLoading={isLoading}
                query={query}
                onResultClick={handleResultClick}
                showPreview={true}
              />
            )}

            {activeTab === 'history' && (
              <SearchHistory
                history={searchHistory}
                onHistoryItemClick={handleHistoryItemClick}
                onRefresh={loadSearchHistory}
              />
            )}

            {activeTab === 'saved' && (
              <SavedSearches
                savedSearches={savedSearches}
                onSavedSearchClick={handleSavedSearchClick}
                onSaveCurrentSearch={handleSaveCurrentSearch}
                currentQuery={query}
                onRefresh={loadSavedSearches}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch