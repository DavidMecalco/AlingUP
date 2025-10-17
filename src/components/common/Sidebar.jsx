import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Ticket, 
  Plus, 
  BarChart3, 
  Users, 
  Settings,
  Search,
  Filter
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['cliente', 'tecnico', 'admin']
      },
      {
        name: 'Tickets',
        href: '/tickets',
        icon: Ticket,
        roles: ['cliente', 'tecnico', 'admin']
      }
    ];

    const roleSpecificItems = {
      cliente: [
        {
          name: 'Crear Ticket',
          href: '/tickets/create',
          icon: Plus,
          roles: ['cliente']
        }
      ],
      tecnico: [
        {
          name: 'Kanban',
          href: '/kanban',
          icon: Filter,
          roles: ['tecnico']
        }
      ],
      admin: [
        {
          name: 'Crear Ticket',
          href: '/tickets/create',
          icon: Plus,
          roles: ['admin']
        },
        {
          name: 'Kanban',
          href: '/kanban',
          icon: Filter,
          roles: ['admin']
        },
        {
          name: 'Analytics',
          href: '/analytics',
          icon: BarChart3,
          roles: ['admin']
        },
        {
          name: 'Configuración',
          href: '/admin/settings',
          icon: Settings,
          roles: ['admin']
        },
        {
          name: 'Búsqueda',
          href: '/search',
          icon: Search,
          roles: ['admin']
        }
      ]
    };

    const userRoleItems = roleSpecificItems[user?.rol] || [];
    return [...baseItems, ...userRoleItems];
  };

  const navigationItems = getNavigationItems();

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={`
          flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Navegación principal"
        aria-hidden={!isOpen ? 'true' : 'false'}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
        </div>

        {/* Navigation */}
        <nav 
          className="flex-1 px-4 py-6 space-y-2 overflow-y-auto"
          role="navigation"
          aria-label="Menú de navegación"
        >
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* User info (mobile only) */}
        <div className="lg:hidden border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3" role="banner" aria-label="Información del usuario">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.nombre_completo?.charAt(0) || user?.email?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre_completo || user?.email}
              </p>
              <p className="text-xs text-primary-600 capitalize">
                {user?.rol}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;