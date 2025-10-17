import React, { useState, useEffect } from 'react'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../common/LoadingSpinner'

const SystemSettings = () => {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'Portal de Tickets',
    systemDescription: 'Sistema de gestión de tickets de soporte técnico',
    supportEmail: 'soporte@empresa.com',
    supportPhone: '+1 (555) 123-4567',
    
    // Ticket Settings
    autoAssignment: true,
    defaultPriority: 'media',
    maxFileSize: 10, // MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'gif', 'zip'],
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Business Hours
    businessHours: {
      monday: { enabled: true, start: '09:00', end: '18:00' },
      tuesday: { enabled: true, start: '09:00', end: '18:00' },
      wednesday: { enabled: true, start: '09:00', end: '18:00' },
      thursday: { enabled: true, start: '09:00', end: '18:00' },
      friday: { enabled: true, start: '09:00', end: '18:00' },
      saturday: { enabled: false, start: '09:00', end: '13:00' },
      sunday: { enabled: false, start: '09:00', end: '13:00' }
    },
    
    // SLA Settings
    slaSettings: {
      urgente: { responseTime: 1, resolutionTime: 4 }, // hours
      alta: { responseTime: 2, resolutionTime: 8 },
      media: { responseTime: 4, resolutionTime: 24 },
      baja: { responseTime: 8, resolutionTime: 72 }
    }
  })

  const [activeSection, setActiveSection] = useState('general')

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSimpleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBusinessHourChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleSLAChange = (priority, field, value) => {
    setSettings(prev => ({
      ...prev,
      slaSettings: {
        ...prev.slaSettings,
        [priority]: {
          ...prev.slaSettings[priority],
          [field]: parseInt(value) || 0
        }
      }
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Here you would save to your backend/database
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Configuración guardada exitosamente')
    } catch (err) {
      showError('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'tickets', name: 'Tickets', icon: '🎫' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
    { id: 'business', name: 'Horarios', icon: '🕒' },
    { id: 'sla', name: 'SLA', icon: '⏱️' }
  ]

  const days = [
    { key: 'monday', name: 'Lunes' },
    { key: 'tuesday', name: 'Martes' },
    { key: 'wednesday', name: 'Miércoles' },
    { key: 'thursday', name: 'Jueves' },
    { key: 'friday', name: 'Viernes' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ]

  const priorities = [
    { key: 'urgente', name: 'Urgente', color: 'text-red-600' },
    { key: 'alta', name: 'Alta', color: 'text-orange-600' },
    { key: 'media', name: 'Media', color: 'text-yellow-600' },
    { key: 'baja', name: 'Baja', color: 'text-green-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-600">Administra las configuraciones generales del sistema</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Configuración General</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Sistema
                    </label>
                    <input
                      type="text"
                      value={settings.systemName}
                      onChange={(e) => handleSimpleInputChange('systemName', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Soporte
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSimpleInputChange('supportEmail', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de Soporte
                    </label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => handleSimpleInputChange('supportPhone', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Sistema
                  </label>
                  <textarea
                    value={settings.systemDescription}
                    onChange={(e) => handleSimpleInputChange('systemDescription', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Ticket Settings */}
            {activeSection === 'tickets' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Configuración de Tickets</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoAssignment"
                      checked={settings.autoAssignment}
                      onChange={(e) => handleSimpleInputChange('autoAssignment', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoAssignment" className="ml-2 text-sm text-gray-700">
                      Asignación automática de tickets
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad por defecto
                    </label>
                    <select
                      value={settings.defaultPriority}
                      onChange={(e) => handleSimpleInputChange('defaultPriority', e.target.value)}
                      className="input-field w-auto"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tamaño máximo de archivo (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => handleSimpleInputChange('maxFileSize', parseInt(e.target.value))}
                      className="input-field w-auto"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipos de archivo permitidos
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', 'txt'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.allowedFileTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSimpleInputChange('allowedFileTypes', [...settings.allowedFileTypes, type])
                              } else {
                                handleSimpleInputChange('allowedFileTypes', settings.allowedFileTypes.filter(t => t !== type))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSimpleInputChange('emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                      Notificaciones por email
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSimpleInputChange('smsNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                      Notificaciones por SMS
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSimpleInputChange('pushNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="pushNotifications" className="ml-2 text-sm text-gray-700">
                      Notificaciones push
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours */}
            {activeSection === 'business' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Horarios de Atención</h3>
                
                <div className="space-y-4">
                  {days.map(day => (
                    <div key={day.key} className="flex items-center space-x-4">
                      <div className="w-20">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.businessHours[day.key].enabled}
                            onChange={(e) => handleBusinessHourChange(day.key, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{day.name}</span>
                        </label>
                      </div>
                      
                      {settings.businessHours[day.key].enabled && (
                        <>
                          <div>
                            <input
                              type="time"
                              value={settings.businessHours[day.key].start}
                              onChange={(e) => handleBusinessHourChange(day.key, 'start', e.target.value)}
                              className="input-field w-auto"
                            />
                          </div>
                          <span className="text-gray-500">a</span>
                          <div>
                            <input
                              type="time"
                              value={settings.businessHours[day.key].end}
                              onChange={(e) => handleBusinessHourChange(day.key, 'end', e.target.value)}
                              className="input-field w-auto"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLA Settings */}
            {activeSection === 'sla' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Configuración de SLA</h3>
                <p className="text-sm text-gray-600">
                  Define los tiempos de respuesta y resolución para cada prioridad (en horas)
                </p>
                
                <div className="space-y-4">
                  {priorities.map(priority => (
                    <div key={priority.key} className="border rounded-lg p-4">
                      <h4 className={`font-medium mb-3 ${priority.color}`}>
                        Prioridad {priority.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiempo de respuesta (horas)
                          </label>
                          <input
                            type="number"
                            value={settings.slaSettings[priority.key].responseTime}
                            onChange={(e) => handleSLAChange(priority.key, 'responseTime', e.target.value)}
                            className="input-field w-auto"
                            min="0.5"
                            step="0.5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiempo de resolución (horas)
                          </label>
                          <input
                            type="number"
                            value={settings.slaSettings[priority.key].resolutionTime}
                            onChange={(e) => handleSLAChange(priority.key, 'resolutionTime', e.target.value)}
                            className="input-field w-auto"
                            min="1"
                            step="1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings