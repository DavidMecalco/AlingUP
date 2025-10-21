import React, { useState, useEffect } from 'react'
import { validateCreateTicketForm } from '../../utils/validation'
import { TICKET_PRIORITIES } from '../../utils/constants'
import ticketService from '../../services/ticketService'
import CustomRichTextEditor from '../editor/CustomRichTextEditor'
import TicketIdDisplay from './TicketIdDisplay'
import DatabaseStatus from '../debug/DatabaseStatus'
import { 
  Type, 
  FileText, 
  AlertTriangle, 
  Tag, 
  Save, 
  X,
  Loader,
  Hash
} from 'lucide-react'
import '../../styles/glass.css'

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
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [databaseReady, setDatabaseReady] = useState(false)

  // Load ticket types on component mount
  useEffect(() => {
    const loadTicketTypes = async () => {
      setIsLoadingTypes(true)
      try {
        console.log('Loading ticket types...')
        const { data, error } = await ticketService.getTicketTypes()
        console.log('Ticket types response:', { data, error })
        
        if (error) {
          console.error('Error loading ticket types:', error)
          setTicketTypes([])
        } else {
          console.log('Ticket types loaded:', data)
          setTicketTypes(data || [])
          // Set first type as default if no initial data
          if (data && data.length > 0 && !initialData) {
            setFormData(prev => ({ ...prev, tipo_ticket_id: data[0].id }))
          }
        }
      } catch (error) {
        console.error('Error loading ticket types:', error)
        setTicketTypes([])
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
        <div className="glass-morphism rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-morphism rounded-2xl flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">ID del Ticket</h3>
                <p className="text-xs text-white/60">Usa este ID para dar seguimiento</p>
              </div>
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
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-purple-400" />
          <label htmlFor="titulo" className="text-sm font-medium text-white">
            Título del Ticket *
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            className={`glass-input w-full px-4 py-4 rounded-2xl text-white placeholder-white/50 transition-all duration-300 ${
              formErrors.titulo 
                ? 'ring-2 ring-red-400/50 border-red-400/50' 
                : 'focus:ring-2 focus:ring-purple-400/50'
            }`}
            placeholder="Describe brevemente el problema o solicitud"
            disabled={isLoading}
            maxLength={200}
          />
        </div>
        {formErrors.titulo && (
          <p className="text-sm text-red-400 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{formErrors.titulo}</span>
          </p>
        )}
        <div className="flex justify-between items-center">
          <p className="text-xs text-white/60">
            Sé específico y claro en el título
          </p>
          <p className="text-xs text-white/60">
            {formData.titulo.length}/200
          </p>
        </div>
      </div>

      {/* Description Field with Rich Text Editor */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <label htmlFor="descripcion" className="text-sm font-medium text-white">
            Descripción Detallada *
          </label>
        </div>
        <div className={`glass-morphism rounded-2xl p-1 ${
          formErrors.descripcion ? 'ring-2 ring-red-400/50' : ''
        }`}>
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
          <p className="text-sm text-red-400 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{formErrors.descripcion}</span>
          </p>
        )}
        <div className="glass-morphism rounded-xl p-3">
          <p className="text-xs text-white/70">
            <strong className="text-white">Consejos:</strong> Incluye pasos para reproducir el problema, mensajes de error, 
            capturas de pantalla o cualquier información adicional que pueda ser útil.
          </p>
        </div>
      </div>

      {/* Priority and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Field */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <label htmlFor="prioridad" className="text-sm font-medium text-white">
              Prioridad *
            </label>
          </div>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleInputChange}
            className={`glass-input w-full px-4 py-4 rounded-2xl text-white bg-white/10 transition-all duration-300 ${
              formErrors.prioridad 
                ? 'ring-2 ring-red-400/50 border-red-400/50' 
                : 'focus:ring-2 focus:ring-purple-400/50'
            }`}
            disabled={isLoading}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.prioridad && (
            <p className="text-sm text-red-400 flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{formErrors.prioridad}</span>
            </p>
          )}
          <div className="glass-morphism rounded-xl p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-white/80"><strong className="text-red-400">Urgente:</strong> Problemas críticos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-white/80"><strong className="text-yellow-400">Alta:</strong> Requiere atención pronta</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-white/80"><strong className="text-blue-400">Media:</strong> Sin impacto crítico</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-white/80"><strong className="text-gray-400">Baja:</strong> Consultas menores</span>
            </div>
          </div>
        </div>

        {/* Ticket Type Field */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-green-400" />
            <label htmlFor="tipo_ticket_id" className="text-sm font-medium text-white">
              Tipo de Ticket *
            </label>
          </div>
          {isLoadingTypes ? (
            <div className="glass-input w-full px-4 py-4 rounded-2xl flex items-center text-white/70">
              <Loader className="animate-spin w-4 h-4 mr-2" />
              Cargando tipos...
            </div>
          ) : ticketTypes.length === 0 ? (
            <div className="glass-input w-full px-4 py-4 rounded-2xl flex items-center text-red-400">
              <AlertTriangle className="w-4 h-4 mr-2" />
              No hay tipos de tickets disponibles. Contacta al administrador.
            </div>
          ) : (
            <select
              id="tipo_ticket_id"
              name="tipo_ticket_id"
              value={formData.tipo_ticket_id}
              onChange={handleInputChange}
              className={`glass-input w-full px-4 py-4 rounded-2xl text-white bg-white/10 transition-all duration-300 ${
                formErrors.tipo_ticket_id 
                  ? 'ring-2 ring-red-400/50 border-red-400/50' 
                  : 'focus:ring-2 focus:ring-purple-400/50'
              }`}
              disabled={isLoading}
            >
              <option value="" className="bg-gray-800 text-white">Selecciona un tipo</option>
              {ticketTypes.map(type => (
                <option key={type.id} value={type.id} className="bg-gray-800 text-white">
                  {type.nombre}
                </option>
              ))}
            </select>
          )}
          {formErrors.tipo_ticket_id && (
            <p className="text-sm text-red-400 flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{formErrors.tipo_ticket_id}</span>
            </p>
          )}
          {formData.tipo_ticket_id && (
            <div className="glass-morphism rounded-xl p-3">
              {ticketTypes.find(t => t.id === formData.tipo_ticket_id)?.descripcion && (
                <p className="text-sm text-white/80">
                  {ticketTypes.find(t => t.id === formData.tipo_ticket_id).descripcion}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={isLoading || isLoadingTypes}
          className="glass-button flex-1 sm:flex-none px-8 py-4 rounded-2xl text-white font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              <span>{initialData ? 'Actualizando...' : 'Creando...'}</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{initialData ? 'Actualizar Ticket' : 'Crear Ticket'}</span>
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="glass-button flex-1 sm:flex-none px-8 py-4 rounded-2xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
        )}
      </div>

      {/* Debug Information - Show when there are issues */}
      {(ticketTypes.length === 0 && !isLoadingTypes) && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="glass-button px-4 py-2 rounded-xl text-white/70 text-sm hover:bg-white/10 transition-colors mb-4"
          >
            {showDebugInfo ? 'Ocultar' : 'Mostrar'} información de diagnóstico
          </button>
          
          {showDebugInfo && (
            <DatabaseStatus onStatusChange={setDatabaseReady} />
          )}
        </div>
      )}
    </form>
  )
}

export default TicketForm