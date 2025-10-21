import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Building2, Users, Settings, Shield, Sparkles } from 'lucide-react'
import ClientManagement from './ClientManagement'
import TechnicianManagement from './TechnicianManagement'
import SystemSettings from './SystemSettings'

const AdminSettings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('clients')

  // Check if user is admin
  if (!user || user.profile?.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Acceso Restringido</h2>
          <p className="text-gray-600 leading-relaxed">
            Solo los administradores pueden acceder a la configuración del sistema.
          </p>
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              Contacta a tu administrador para obtener los permisos necesarios.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'clients',
      name: 'Gestión de Clientes',
      icon: Building2,
      description: 'Administrar empresas y organizaciones cliente',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'technicians',
      name: 'Gestión de Técnicos',
      icon: Users,
      description: 'Administrar el equipo de soporte técnico',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'system',
      name: 'Configuración del Sistema',
      icon: Settings,
      description: 'Configuraciones generales y parámetros del sistema',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-r from-purple-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-purple-100 to-indigo-100',
      iconColor: 'text-purple-600'
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Gestiona usuarios y configuraciones del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? `${tab.bgColor} ring-2 ring-offset-2 ring-offset-white shadow-xl` 
                      : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? tab.iconBg : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className={`w-6 h-6 transition-all duration-300 ${
                        isActive ? tab.iconColor : 'text-gray-600 group-hover:text-gray-700'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-lg transition-all duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {tab.name}
                      </h3>
                      <p className={`text-sm mt-1 transition-all duration-300 ${
                        isActive ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${tab.color}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Content Header */}
          <div className={`px-8 py-6 ${activeTabData?.bgColor} border-b border-gray-100`}>
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTabData?.iconBg}`}>
                {activeTabData && <activeTabData.icon className={`w-5 h-5 ${activeTabData.iconColor}`} />}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTabData?.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTabData?.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Content Body */}
          <div className="p-8">
            {activeTab === 'clients' && <ClientManagement />}
            {activeTab === 'technicians' && <TechnicianManagement />}
            {activeTab === 'system' && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings