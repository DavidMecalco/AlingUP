import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../../contexts/ToastContext'

const TechnicianManagement = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [technicians, setTechnicians] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ estado: 'all', especialidad: 'all' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [techResult, clientResult] = await Promise.all([
        userService.getUsers({ rol: 'tecnico' }),
        userService.getClients()
      ])

      if (techResult.error) {
        showError(techResult.error.message || 'Error al cargar técnicos')
      } else {
        setTechnicians(techResult.data || [])
      }

      if (clientResult.error) {
        showError(clientResult.error.message || 'Error al cargar clientes')
      } else {
        setClients(clientResult.data || [])
      }
    } catch (err) {
      showError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTechnician = async (technicianData) => {
    try {
      const { data, error } = await userService.createTechnician(technicianData)
      if (error) {
        showError(error.message || 'Error al crear técnico')
        return false
      }
      
      success(`Técnico creado exitosamente. Contraseña temporal: ${data.tempPassword}`)
      setShowCreateModal(false)
      loadData()
      return true
    } catch (err) {
      showError('Error al crear técnico')
      return false
    }
  }

  const handleUpdateTechnician = async (technicianData) => {
    try {
      const { data, error } = await userService.updateUser(selectedTechnician.id, technicianData)
      if (error) {
        showError(error.message || 'Error al actualizar técnico')
        return false
      }
      
      success('Técnico actualizado exitosamente')
      setShowEditModal(false)
      setSelectedTechnician(null)
      loadData()
      return true
    } catch (err) {
      showError('Error al actualizar técnico')
      return false
    }
  }

  const handleDeleteTechnician = async (technicianId) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este técnico?')) {
      return
    }

    try {
      const { error } = await userService.deleteUser(technicianId)
      if (error) {
        showError(error.message || 'Error al desactivar técnico')
      } else {
        success('Técnico desactivado exitosamente')
        loadData()
      }
    } catch (err) {
      showError('Error al desactivar técnico')
    }
  }

  const filteredTechnicians = technicians.filter(technician => {
    const matchesSearch = technician.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (technician.especialidad && technician.especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filters.estado === 'all' || 
                         (filters.estado === 'active' && technician.estado) ||
                         (filters.estado === 'inactive' && !technician.estado)
    
    const matchesSpecialty = filters.especialidad === 'all' || 
                            technician.especialidad === filters.especialidad
    
    return matchesSearch && matchesFilter && matchesSpecialty
  })

  const specialties = [...new Set(technicians.map(t => t.especialidad).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Técnicos</h2>
          <p className="text-gray-600">Administra el equipo de soporte técnico</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Nuevo Técnico
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, email o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="input-field w-auto"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <select
          value={filters.especialidad}
          onChange={(e) => setFilters({ ...filters, especialidad: e.target.value })}
          className="input-field w-auto"
        >
          <option value="all">Todas las especialidades</option>
          {specialties.map(specialty => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </select>
      </div>

      {/* Technicians Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol Interno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clientes Asignados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTechnicians.map((technician) => (
                <tr key={technician.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {technician.avatar ? (
                        <img
                          src={technician.avatar}
                          alt={technician.nombre_completo}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                          <span className="text-white font-medium">
                            {technician.nombre_completo.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {technician.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {technician.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {technician.telefono || 'Sin teléfono'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {technician.especialidad || 'No especificada'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {technician.nivel_experiencia || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {technician.rol_interno || 'No especificado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {technician.horario_trabajo || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {technician.clientes_asignados?.length || 0} clientes
                    </div>
                    {technician.clientes_asignados?.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {technician.clientes_asignados.slice(0, 2).map(clientId => {
                          const client = clients.find(c => c.id === clientId)
                          return client?.empresa_cliente || client?.nombre_completo
                        }).join(', ')}
                        {technician.clientes_asignados.length > 2 && ` +${technician.clientes_asignados.length - 2} más`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      technician.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {technician.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTechnician(technician)
                          setShowEditModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      {technician.estado && (
                        <button
                          onClick={() => handleDeleteTechnician(technician.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTechnicians.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron técnicos</p>
          </div>
        )}
      </div>

      {/* Create Technician Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Técnico"
        size="lg"
      >
        <TechnicianForm
          clients={clients}
          onSubmit={handleCreateTechnician}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Technician Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedTechnician(null)
        }}
        title="Editar Técnico"
        size="lg"
      >
        {selectedTechnician && (
          <TechnicianForm
            initialData={selectedTechnician}
            clients={clients}
            onSubmit={handleUpdateTechnician}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedTechnician(null)
            }}
            isEdit={true}
          />
        )}
      </Modal>
    </div>
  )
}

// Technician Form Component
const TechnicianForm = ({ initialData = null, clients = [], onSubmit, onCancel, isEdit = false }) => {
  const { showError } = useToast()
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    rol_interno: '',
    especialidad: '',
    nivel_experiencia: 'Junior',
    horario_trabajo: '9:00 AM - 6:00 PM',
    clientes_asignados: [],
    avatar: '',
    ...initialData
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleClientAssignment = (clientId) => {
    setFormData(prev => ({
      ...prev,
      clientes_asignados: prev.clientes_asignados.includes(clientId)
        ? prev.clientes_asignados.filter(id => id !== clientId)
        : [...prev.clientes_asignados, clientId]
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona un archivo de imagen')
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      showError('El archivo debe ser menor a 2MB')
      return
    }

    setAvatarFile(file)
    setUploading(true)

    try {
      const { data: avatarUrl, error } = await userService.uploadAvatar(file, formData.email || 'user')
      if (error) {
        showError(error.message || 'Error al subir avatar')
      } else {
        setFormData(prev => ({ ...prev, avatar: avatarUrl }))
      }
    } catch (err) {
      showError('Error al subir avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const success = await onSubmit(formData)
      if (success) {
        // Form will be closed by parent component
      }
    } catch (err) {
      showError('Error al procesar formulario')
    } finally {
      setSubmitting(false)
    }
  }

  const specialties = [
    'Soporte Técnico General',
    'Redes y Conectividad',
    'Hardware',
    'Software',
    'Seguridad Informática',
    'Base de Datos',
    'Desarrollo Web',
    'Sistemas Operativos',
    'Cloud Computing',
    'DevOps'
  ]

  const experienceLevels = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Especialista']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            required
            disabled={isEdit}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol Interno
          </label>
          <input
            type="text"
            name="rol_interno"
            value={formData.rol_interno}
            onChange={handleInputChange}
            className="input-field"
            placeholder="ej. Analista de Soporte, Líder Técnico"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Profesional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <select
              name="especialidad"
              value={formData.especialidad}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Seleccionar especialidad</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Experiencia
            </label>
            <select
              name="nivel_experiencia"
              value={formData.nivel_experiencia}
              onChange={handleInputChange}
              className="input-field"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horario de Trabajo
          </label>
          <input
            type="text"
            name="horario_trabajo"
            value={formData.horario_trabajo}
            onChange={handleInputChange}
            className="input-field"
            placeholder="ej. 9:00 AM - 6:00 PM"
          />
        </div>

        {/* Avatar Upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avatar
          </label>
          <div className="flex items-center space-x-4">
            {formData.avatar && (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="h-16 w-16 object-cover rounded-full border"
              />
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={uploading}
              />
              <label
                htmlFor="avatar-upload"
                className={`btn-secondary cursor-pointer ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? 'Subiendo...' : 'Seleccionar Avatar'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG hasta 2MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Assignment */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes Asignados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {clients.map(client => (
            <label key={client.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.clientes_asignados.includes(client.id)}
                onChange={() => handleClientAssignment(client.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {client.logo_empresa && (
                  <img
                    src={client.logo_empresa}
                    alt={client.empresa_cliente}
                    className="h-6 w-6 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {client.empresa_cliente || client.nombre_completo}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {client.nombre_completo}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {clients.length === 0 && (
          <p className="text-gray-500 text-sm">No hay clientes disponibles</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || uploading}
        >
          {submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Técnico')}
        </button>
      </div>
    </form>
  )
}

export default TechnicianManagement