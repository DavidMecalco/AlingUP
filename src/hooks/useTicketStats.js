import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import ticketService from '../services/ticketService'

export const useTicketStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    resueltos: 0,
    asignados: 0,
    loading: true,
    error: null
  })

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))
      
      let result
      
      // Get stats based on user role
      if (user?.profile?.rol === 'cliente') {
        // For clients, get their own tickets
        result = await ticketService.getTicketsByClient(user.id, {})
      } else if (user?.profile?.rol === 'tecnico') {
        // For technicians, get assigned tickets
        result = await ticketService.getTicketsByTechnician(user.id, {})
      } else {
        // For admins, get all tickets
        result = await ticketService.getTickets({}, { page: 1, limit: 1000 })
      }

      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar estadísticas')
      }

      const tickets = result.data || []
      
      // Calculate stats
      const total = tickets.length
      const pendientes = tickets.filter(t => 
        t.estado === 'abierto' || t.estado === 'en_progreso'
      ).length
      const resueltos = tickets.filter(t => 
        t.estado === 'vobo' || t.estado === 'cerrado'
      ).length
      const asignados = tickets.filter(t => 
        t.tecnico && (t.estado === 'en_progreso' || t.estado === 'abierto')
      ).length

      setStats({
        total,
        pendientes,
        resueltos,
        asignados,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error loading ticket stats:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar estadísticas'
      }))
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  // Refresh stats every 30 seconds
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  return {
    ...stats,
    refresh: loadStats
  }
}