import React, { useState } from 'react'
import DatabaseStatus from '../components/debug/DatabaseStatus'
import UserManagement from '../components/debug/UserManagement'
import { Settings, Database, Users, Bug } from 'lucide-react'

const DebugPage = () => {
  const [activeTab, setActiveTab] = useState('database')

  const tabs = [
    {
      id: 'database',
      label: 'Base de Datos',
      icon: Database,
      component: DatabaseStatus
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      component: UserManagement
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-morphism rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 glass-morphism rounded-2xl flex items-center justify-center">
              <Bug className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Debug</h1>
              <p className="text-white/70">Herramientas de diagnóstico y configuración</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`glass-button px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-500/30 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Instructions */}
        <div className="glass-morphism rounded-xl p-6 mt-8 border border-blue-400/30 bg-blue-500/10">
          <div className="flex items-start space-x-3">
            <Settings className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Instrucciones</h4>
              <div className="space-y-2 text-sm text-white/80">
                <p>
                  <strong>Base de Datos:</strong> Verifica la conexión y configuración de Supabase.
                </p>
                <p>
                  <strong>Usuarios:</strong> Crea usuarios de prueba para poder acceder al sistema.
                </p>
                <p>
                  Si tienes problemas de login, asegúrate de que existan usuarios en la base de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPage