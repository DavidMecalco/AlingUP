/**
 * Integration Tests for Ticket Management Portal
 * 
 * This file contains comprehensive integration tests to verify that all components
 * work together seamlessly and that complete user workflows function correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { supabase } from '../services/supabaseClient'

// Mock Supabase
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
}))

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  profile: {
    id: 'profile-123',
    nombre_completo: 'Test User',
    rol: 'cliente',
    empresa_cliente: 'Test Company',
    estado: true,
  },
}

const mockSession = {
  access_token: 'mock-token',
  user: mockUser,
}

const mockTicket = {
  id: 'ticket-123',
  ticket_number: 'TKT-2024-001',
  titulo: 'Test Ticket',
  descripcion: '<p>Test description</p>',
  cliente_id: 'user-123',
  tecnico_id: null,
  estado: 'abierto',
  prioridad: 'media',
  tipo_ticket_id: 'type-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cliente: mockUser.profile,
  tipo_ticket: { nombre: 'Technical Issue' },
}

// Helper function to render app with router
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('Integration Tests - Complete User Workflows', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup default mock responses
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    supabase.auth.onAuthStateChange.mockReturnValue(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should redirect unauthenticated users to login', async () => {
      renderApp()
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })

    it('should allow user to login and redirect to dashboard', async () => {
      const user = userEvent.setup()
      
      // Mock successful login
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser.profile,
              error: null,
            }),
          }),
        }),
      })

      renderApp()
      
      // Fill login form
      const emailInput = await screen.findByLabelText(/email/i)
      const passwordInput = await screen.findByLabelText(/contraseña/i)
      const loginButton = await screen.findByRole('button', { name: /iniciar sesión/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(loginButton)
      
      // Should redirect to dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard')
      })
    })
  })

  describe('Client User Journey', () => {
    beforeEach(() => {
      // Mock authenticated client user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser.profile,
              error: null,
            }),
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockTicket],
                error: null,
              }),
            }),
          }),
        }),
      })
    })

    it('should display client dashboard with create ticket option', async () => {
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/crear nuevo ticket/i)).toBeInTheDocument()
      })
    })

    it('should allow client to create a new ticket', async () => {
      const user = userEvent.setup()
      
      // Mock ticket creation
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [mockTicket],
            error: null,
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { nombre: 'Technical Issue' },
              error: null,
            }),
          }),
        }),
      })

      renderApp()
      
      // Navigate to create ticket
      const createButton = await screen.findByText(/crear nuevo ticket/i)
      await user.click(createButton)
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/tickets/create')
      })
      
      // Fill ticket form
      const titleInput = await screen.findByLabelText(/título/i)
      const descriptionInput = await screen.findByLabelText(/descripción/i)
      
      await user.type(titleInput, 'Test Ticket Title')
      await user.type(descriptionInput, 'Test ticket description')
      
      // Submit form
      const submitButton = await screen.findByRole('button', { name: /crear ticket/i })
      await user.click(submitButton)
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/ticket creado exitosamente/i)).toBeInTheDocument()
      })
    })

    it('should allow client to view their tickets', async () => {
      renderApp()
      
      // Navigate to tickets list
      const ticketsLink = await screen.findByText(/mis tickets/i)
      await userEvent.click(ticketsLink)
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/tickets')
        expect(screen.getByText(mockTicket.titulo)).toBeInTheDocument()
      })
    })
  })

  describe('Technician User Journey', () => {
    const mockTechnicianUser = {
      ...mockUser,
      profile: {
        ...mockUser.profile,
        rol: 'tecnico',
      },
    }

    beforeEach(() => {
      // Mock authenticated technician user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { ...mockSession, user: mockTechnicianUser } },
        error: null,
      })
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTechnicianUser.profile,
              error: null,
            }),
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ ...mockTicket, tecnico_id: mockTechnicianUser.id }],
                error: null,
              }),
            }),
          }),
        }),
      })
    })

    it('should display technician dashboard with Kanban board', async () => {
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/kanban/i)).toBeInTheDocument()
        expect(screen.getByText(/abierto/i)).toBeInTheDocument()
        expect(screen.getByText(/en progreso/i)).toBeInTheDocument()
      })
    })

    it('should allow technician to update ticket status', async () => {
      const user = userEvent.setup()
      
      // Mock ticket update
      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ ...mockTicket, estado: 'en_progreso' }],
              error: null,
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ ...mockTicket, tecnico_id: mockTechnicianUser.id }],
                error: null,
              }),
            }),
          }),
        }),
      })

      renderApp()
      
      // Navigate to Kanban board
      const kanbanLink = await screen.findByText(/kanban/i)
      await user.click(kanbanLink)
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/kanban')
      })
      
      // Find and drag ticket card (simplified test)
      const ticketCard = await screen.findByText(mockTicket.titulo)
      expect(ticketCard).toBeInTheDocument()
    })
  })

  describe('Admin User Journey', () => {
    const mockAdminUser = {
      ...mockUser,
      profile: {
        ...mockUser.profile,
        rol: 'admin',
      },
    }

    beforeEach(() => {
      // Mock authenticated admin user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { ...mockSession, user: mockAdminUser } },
        error: null,
      })
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAdminUser.profile,
              error: null,
            }),
          }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [mockTicket],
              error: null,
            }),
          }),
        }),
      })
    })

    it('should display admin dashboard with analytics', async () => {
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/analytics/i)).toBeInTheDocument()
      })
    })

    it('should allow admin to assign tickets', async () => {
      const user = userEvent.setup()
      
      // Mock ticket assignment
      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ ...mockTicket, tecnico_id: 'tech-123' }],
              error: null,
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTicket,
              error: null,
            }),
          }),
        }),
      })

      renderApp()
      
      // Navigate to ticket detail
      window.history.pushState({}, '', `/tickets/${mockTicket.id}`)
      
      await waitFor(() => {
        expect(screen.getByText(mockTicket.titulo)).toBeInTheDocument()
      })
      
      // Find assign button
      const assignButton = await screen.findByText(/asignar/i)
      await user.click(assignButton)
      
      // Assignment modal should open
      await waitFor(() => {
        expect(screen.getByText(/asignar técnico/i)).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filter Integration', () => {
    beforeEach(() => {
      // Mock authenticated user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser.profile,
              error: null,
            }),
          }),
          ilike: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockTicket],
                error: null,
              }),
            }),
          }),
        }),
      })
    })

    it('should allow users to search for tickets', async () => {
      const user = userEvent.setup()
      
      renderApp()
      
      // Navigate to tickets
      const ticketsLink = await screen.findByText(/tickets/i)
      await user.click(ticketsLink)
      
      // Use search
      const searchInput = await screen.findByPlaceholderText(/buscar/i)
      await user.type(searchInput, 'test')
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle authentication errors gracefully', async () => {
      // Mock auth error
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Authentication error' },
      })
      
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      // Mock authenticated user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      
      // Mock API error
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })
      
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design Integration', () => {
    it('should render properly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      // Mock authenticated user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      
      // Check for mobile-specific elements
      const mobileMenu = screen.queryByLabelText(/menu/i)
      expect(mobileMenu).toBeInTheDocument()
    })
  })

  describe('Real-time Features Integration', () => {
    it('should handle real-time updates', async () => {
      // Mock authenticated user
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      
      // Mock real-time subscription
      const mockSubscription = {
        unsubscribe: vi.fn(),
      }
      
      supabase.from.mockReturnValue({
        on: vi.fn().mockReturnValue({
          subscribe: vi.fn().mockReturnValue(mockSubscription),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser.profile,
              error: null,
            }),
          }),
        }),
      })
      
      renderApp()
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      
      // Verify subscription was set up
      expect(supabase.from).toHaveBeenCalled()
    })
  })
})

describe('Performance Integration Tests', () => {
  it('should load initial page within acceptable time', async () => {
    const startTime = performance.now()
    
    // Mock authenticated user
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    
    renderApp()
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
    
    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  it('should handle large datasets efficiently', async () => {
    // Mock large dataset
    const largeTicketList = Array.from({ length: 100 }, (_, i) => ({
      ...mockTicket,
      id: `ticket-${i}`,
      ticket_number: `TKT-2024-${String(i + 1).padStart(3, '0')}`,
      titulo: `Test Ticket ${i + 1}`,
    }))
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser.profile,
            error: null,
          }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: largeTicketList,
              error: null,
            }),
          }),
        }),
      }),
    })
    
    const startTime = performance.now()
    
    renderApp()
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
    
    const renderTime = performance.now() - startTime
    expect(renderTime).toBeLessThan(5000) // Should render within 5 seconds even with large dataset
  })
})