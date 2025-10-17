import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../../contexts/ToastContext'

const ClientManagement = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ estado: 'all' })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    try {
      const { data, error } = await userService.getUsers({ rol: 'cliente' })
      if (error) {
        showError(error.message || 'Error al cargar clientes')
      } else {
        setClients(data || [])
      }
    } catch (err) {
      showError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (clientData) => {
    try {
      const { data, error } = await userService.createClient(clientData)
      if (error) {
        showError(error.message || 'Error al crear cliente')
        return false
      }
      
      success(`Cliente creado exitosamente. Contraseña temporal: ${data.tempPassword}`)
      setShowCreateModal(false)
      loadClients()
      return true
    } catch (err) {
      showError('Error al crear cliente')
      return false
    }
  }

  const handleUpdateClient = async (clientData) => {
    try {
      const { data, error } = await userService.updateUser(selectedClient.id, clientData)
      if (error) {
        showError(error.message || 'Error al actualizar cliente')
        return false
      }
      
      success('Cliente actualizado exitosamente')
      setShowEditModal(false)
      setSelectedClient(null)
      loadClients()
      return true
    } catch (err) {
      showError('Error al actualizar cliente')
      return false
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este cliente?')) {
      return
    }

    try {
      const { error } = await userService.deleteUser(clientId)
      if (error) {
        showError(error.message || 'Error al desactivar cliente')
      } else {
        success('Cliente desactivado exitosamente')
        loadClients()
      }
    } catch (err) {
      showError('Error al desactivar cliente')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.empresa_cliente && client.empresa_cliente.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filters.estado === 'all' || 
                         (filters.estado === 'active' && client.estado) ||
                         (filters.estado === 'inactive' && !client.estado)
    
    return matchesSearch && matchesFilter
  })

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-600">Administra los clientes y sus organizaciones</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
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
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.logo_empresa ? (
                        <img
                          src={client.logo_empresa}
                          alt={`Logo ${client.empresa_cliente}`}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {client.nombre_completo.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.empresa_cliente || 'No especificada'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.departamento || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.telefono || 'No especificado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.ciudad && client.pais ? `${client.ciudad}, ${client.pais}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.fecha_registro || client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client)
                          setShowEditModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      {client.estado && (
                        <button
                          onClick={() => handleDeleteClient(client.id)}
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

        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Cliente"
        size="lg"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedClient(null)
        }}
        title="Editar Cliente"
        size="lg"
      >
        {selectedClient && (
          <ClientForm
            initialData={selectedClient}
            onSubmit={handleUpdateClient}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedClient(null)
            }}
            isEdit={true}
          />
        )}
      </Modal>
    </div>
  )
}

// Client Form Component
const ClientForm = ({ initialData = null, onSubmit, onCancel, isEdit = false }) => {
  const { showError } = useToast()
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    empresa_cliente: '',
    direccion: '',
    ciudad: '',
    pais: '',
    contacto_principal: '',
    departamento: '',
    logo_empresa: '',
    ...initialData
  })
  const [logoFile, setLogoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e) => {
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

    setLogoFile(file)
    setUploading(true)

    try {
      const { data: logoUrl, error } = await userService.uploadCompanyLogo(file, formData.empresa_cliente || 'company')
      if (error) {
        showError(error.message || 'Error al subir logo')
      } else {
        setFormData(prev => ({ ...prev, logo_empresa: logoUrl }))
      }
    } catch (err) {
      showError('Error al subir logo')
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
            Departamento
          </label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
      </div>

      {/* Company Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa/Organización *
            </label>
            <input
              type="text"
              name="empresa_cliente"
              value={formData.empresa_cliente}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto Principal
            </label>
            <input
              type="text"
              name="contacto_principal"
              value={formData.contacto_principal}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            className="input-field"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo de la Empresa
          </label>
          <div className="flex items-center space-x-4">
            {formData.logo_empresa && (
              <img
                src={formData.logo_empresa}
                alt="Logo empresa"
                className="h-16 w-16 object-cover rounded-lg border"
              />
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="logo-upload"
                className={`btn-secondary cursor-pointer ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? 'Subiendo...' : 'Seleccionar Logo'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG hasta 2MB
              </p>
            </div>
          </div>
        </div>
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
          {submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Cliente')}
        </button>
      </div>
    </form>
  )
}

export default ClientManagement