import React, { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'

const SearchBar = ({ 
  onSearch, 
  placeholder = "Buscar tickets...", 
  initialValue = "",
  debounceMs = 300 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  // Call onSearch when debounced search term changes
  useEffect(() => {
    onSearch(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearch])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input-field pl-10 pr-10"
        placeholder={placeholder}
        aria-label="Buscar tickets"
      />
      
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150"
          aria-label="Limpiar búsqueda"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchBar