import React, { useState, useEffect } from 'react'
import { validateCreateTicketForm } from '../../utils/validation'
import { TICKET_PRIORITIES } from '../../utils/constants'
import ticketService from '../../services/ticketService'
import CustomRichTextEditor from '../editor/CustomRichTextEditor'
import TicketIdDisplay from './TicketIdDisplay'

const TicketForm = ({ onSubmit, onCancel, isLoading = false, initialData = null, showTicketId = false }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    tipo_ticket_id: ''
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [ticketTypes, setTicketTypes] = useState([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)

  // Load ticket types on component mount
  useEffect(() => {
    const loadTicketTypes = async () => {
      setIsLoadingTypes(true)
      try {
        const { data, error } = await ticketService.getTicketTypes()
        if (error) {
          console.error('Error loading ticket types:', error)
        } else {
          setTicketTypes(data)
          // Set first type as default if no initial data
          if (data.length > 0 && !initialData) {
            setFormData(prev => ({ ...prev, tipo_ticket_id: data[0].id }))
          }
        }
      } catch (error) {
        console.error('Error loading ticket types:', error)
      } finally {
        setIsLoadingTypes(false)
      }
    }

    loadTicketTypes()
  }, [initialData])

  // Set initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        descripcion: initialData.descripcion || '',
        prioridad: initialData.prioridad || 'media',
        tipo_ticket_id: initialData.tipo_ticket_id || ''
      })
    }
  }, [initialData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setFormErrors({})
    
    // Validate form
    const validation = validateCreateTicketForm(formData)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    // Call onSubmit with form data
    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  const priorityOptions = [
    { value: 'baja', label: 'Baja', color: 'text-gray-600' },
    { value: 'media', label: 'Media', color: 'text-blue-600' },
    { value: 'alta', label: 'Alta', color: 'text-yellow-600' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-600' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket ID Display (for existing tickets or after creation) */}
      {showTicketId && initialData?.ticket_number && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">ID del Ticket</h3>
              <p className="text-xs text-gray-500">Usa este ID para dar seguimiento a tu ticket</p>
            </div>
            <TicketIdDisplay 
              ticketNumber={initialData.ticket_number} 
              size="medium"
              showCopyButton={true}
            />
          </div>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
          Título del Ticket *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleInputChange}
          className={`input-field ${formErrors.titulo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Describe brevemente el problema o solicitud"
          disabled={isLoading}
          maxLength={200}
        />
        {formErrors.titulo && (
          <p className="mt-1 text-sm text-red-600">{formErrors.titulo}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.titulo.length}/200 caracteres
        </p>
      </div>

      {/* Description Field with Rich Text Editor */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Detallada *
        </label>
        <div className={`${formErrors.descripcion ? 'ring-2 ring-red-300 rounded-md' : ''}`}>
          <CustomRichTextEditor
            value={formData.descripcion}
            onChange={(content) => {
              setFormData(prev => ({ ...prev, descripcion: content }))
              // Clear error when user starts typing
              if (formErrors.descripcion) {
                setFormErrors(prev => ({ ...prev, descripcion: '' }))
              }
            }}
            placeholder="Proporciona todos los detalles relevantes sobre el problema o solicitud. Puedes usar formato de texto, listas, código e insertar imágenes."
            disabled={isLoading}
            enableImageUpload={true}
            enableVoiceNotes={true}
            height={250}
          />
        </div>
        {formErrors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{formErrors.descripcion}</p>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p>
            <strong>Consejos:</strong> Incluye pasos para reproducir el problema, mensajes de error, 
            capturas de pantalla o cualquier información adicional que pueda ser útil.
          </p>
        </div>
      </div>

      {/* Priority and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Field */}
        <div>
          <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-2">
            Prioridad *
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleInputChange}
            className={`input-field ${formErrors.prioridad ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            disabled={isLoading}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.prioridad && (
            <p className="mt-1 text-sm text-red-600">{formErrors.prioridad}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            <div className="space-y-1">
              <div><span className="font-medium text-red-600">Urgente:</span> Problemas críticos que afectan operaciones</div>
              <div><span className="font-medium text-yellow-600">Alta:</span> Problemas importantes que requieren atención pronta</div>
              <div><span className="font-medium text-blue-600">Media:</span> Problemas normales sin impacto crítico</div>
              <div><span className="font-medium text-gray-600">Baja:</span> Consultas o mejoras menores</div>
            </div>
          </div>
        </div>

        {/* Ticket Type Field */}
        <div>
          <label htmlFor="tipo_ticket_id" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Ticket *
          </label>
          {isLoadingTypes ? (
            <div className="input-field bg-gray-50 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Cargando tipos...
            </div>
          ) : (
            <select
              id="tipo_ticket_id"
              name="tipo_ticket_id"
              value={formData.tipo_ticket_id}
              onChange={handleInputChange}
              className={`input-field ${formErrors.tipo_ticket_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              disabled={isLoading}
            >
              <option value="">Selecciona un tipo</option>
              {ticketTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nombre}
                </option>
              ))}
            </select>
          )}
          {formErrors.tipo_ticket_id && (
            <p className="mt-1 text-sm text-red-600">{formErrors.tipo_ticket_id}</p>
          )}
          {formData.tipo_ticket_id && (
            <div className="mt-2">
              {ticketTypes.find(t => t.id === formData.tipo_ticket_id)?.descripcion && (
                <p className="text-sm text-gray-600">
                  {ticketTypes.find(t => t.id === formData.tipo_ticket_id).descripcion}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || isLoadingTypes}
          className="btn-primary flex-1 sm:flex-none sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {initialData ? 'Actualizando...' : 'Creando...'}
            </div>
          ) : (
            initialData ? 'Actualizar Ticket' : 'Crear Ticket'
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary flex-1 sm:flex-none sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default TicketForm