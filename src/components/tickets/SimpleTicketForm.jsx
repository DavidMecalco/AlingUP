import React, { useState } from 'react'
import { AlertTriangle, Send, X } from 'lucide-react'

const SimpleTicketForm = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media'
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-white/90 mb-2">
          Título del Ticket *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleInputChange}
          className={`glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 ${
            errors.titulo ? 'ring-2 ring-red-400/50' : ''
          }`}
          placeholder="Describe brevemente el problema..."
          disabled={isLoading}
        />
        {errors.titulo && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {errors.titulo}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-white/90 mb-2">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={4}
          className={`glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 resize-none ${
            errors.descripcion ? 'ring-2 ring-red-400/50' : ''
          }`}
          placeholder="Describe detalladamente el problema o solicitud..."
          disabled={isLoading}
        />
        {errors.descripcion && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {errors.descripcion}
          </p>
        )}
      </div>

      {/* Prioridad */}
      <div>
        <label htmlFor="prioridad" className="block text-sm font-medium text-white/90 mb-2">
          Prioridad
        </label>
        <select
          id="prioridad"
          name="prioridad"
          value={formData.prioridad}
          onChange={handleInputChange}
          className="glass-input w-full px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300"
          disabled={isLoading}
        >
          <option value="baja" className="bg-gray-800 text-white">Baja</option>
          <option value="media" className="bg-gray-800 text-white">Media</option>
          <option value="alta" className="bg-gray-800 text-white">Alta</option>
          <option value="urgente" className="bg-gray-800 text-white">Urgente</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 glass-button px-6 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 hover:to-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Crear Ticket</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="glass-button px-6 py-3 rounded-xl text-white/70 hover:text-white font-medium bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <X className="w-5 h-5" />
          <span>Cancelar</span>
        </button>
      </div>
    </form>
  )
}

export default SimpleTicketForm