import { useState, useEffect } from 'react'
import AdminDashboard from './AdminDashboard'
import ClientDashboard from './ClientDashboard'
import TechnicianDashboard from './TechnicianDashboard'
import DashboardNavigation from './DashboardNavigation'
import { supabase } from '../../services/supabaseClient'

/**
 * Main dashboard container that manages different dashboard views
 * Handles navigation between admin, client, and technician dashboards
 * @returns {JSX.Element}
 */
const DashboardContainer = () => {
  const [activeView, setActiveView] = useState('admin')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null)
  const [clientInfo, setClientInfo] = useState(null)
  const [technicianInfo, setTechnicianInfo] = useState(null)

  // Load client info when client is selected
  useEffect(() => {
    if (selectedClientId) {
      loadClientInfo(selectedClientId)
    } else {
      setClientInfo(null)
    }
  }, [selectedClientId])

  // Load technician info when technician is selected
  useEffect(() => {
    if (selectedTechnicianId) {
      loadTechnicianInfo(selectedTechnicianId)
    } else {
      setTechnicianInfo(null)
    }
  }, [selectedTechnicianId])

  const loadClientInfo = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre_completo, empresa_cliente, email')
        .eq('id', clientId)
        .single()

      if (error) {
        console.error('Error loading client info:', error)
        return
      }

      setClientInfo(data)
    } catch (error) {
      console.error('Error loading client info:', error)
    }
  }

  const loadTechnicianInfo = async (technicianId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre_completo, email')
        .eq('id', technicianId)
        .single()

      if (error) {
        console.error('Error loading technician info:', error)
        return
      }

      setTechnicianInfo(data)
    } catch (error) {
      console.error('Error loading technician info:', error)
    }
  }

  const handleViewChange = (view) => {
    setActiveView(view)
    
    // Clear selections when switching views
    if (view !== 'client') {
      setSelectedClientId(null)
      setClientInfo(null)
    }
    if (view !== 'technician') {
      setSelectedTechnicianId(null)
      setTechnicianInfo(null)
    }
  }

  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId)
  }

  const handleTechnicianChange = (technicianId) => {
    setSelectedTechnicianId(technicianId)
  }

  const renderDashboard = () => {
    switch (activeView) {
      case 'admin':
        return <AdminDashboard />
      
      case 'client':
        return (
          <ClientDashboard 
            clienteId={selectedClientId}
            clienteInfo={clientInfo}
          />
        )
      
      case 'technician':
        return (
          <TechnicianDashboard 
            tecnicoId={selectedTechnicianId}
            tecnicoInfo={technicianInfo}
          />
        )
      
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="pt-6 px-6">
          <DashboardNavigation
            activeView={activeView}
            onViewChange={handleViewChange}
            selectedClientId={selectedClientId}
            onClientChange={handleClientChange}
            selectedTechnicianId={selectedTechnicianId}
            onTechnicianChange={handleTechnicianChange}
          />
        </div>

        {/* Dashboard Content */}
        <div className="pb-6">
          {renderDashboard()}
        </div>
      </div>
    </div>
  )
}

export default DashboardContainer