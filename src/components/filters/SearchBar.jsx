import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = ({ 
  onSearch, 
  placeholder = "Buscar...", 
  initialValue = "",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Debounced search - trigger search after user stops typing
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      onSearch(value)
    }, 300)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBar