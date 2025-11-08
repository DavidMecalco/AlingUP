import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Ticket, 
  Plus, 
  BarChart3, 
  Settings,
  Search,
  Filter
} from 'lucide-react';
import '../../styles/glass.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, getUserRole } = useAuth();
  const location = useLocation();
  
  const userRole = getUserRole();

  // Debug logging
  console.log('Sidebar - User:', user);
  console.log('Sidebar - User profile:', user?.profile);
  console.log('Sidebar - User role from getUserRole():', userRole);
  console.log('Sidebar - User.profile.rol direct:', user?.profile?.rol);
  console.log('Sidebar - Current location:', location.pathname);

  const getNavigationItems = () => {
    // Always show basic navigation items
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

    // Add role-specific items if user and role are available
    if (!userRole) {
      console.log('No user role found, showing basic items only');
      // Still show basic items even without role
      return baseItems;
    }

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
          name: 'Administración',
          href: '/admin',
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

    const userRoleItems = roleSpecificItems[userRole] || [];
    console.log('Navigation items for role', userRole, ':', [...baseItems, ...userRoleItems]);
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
          flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300
          ${isActive 
            ? 'glass-morphism bg-gradient-to-r from-blue-100 to-emerald-100 text-gray-900 border-l-2 border-blue-600' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
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
          ${isOpen ? 'fixed' : 'hidden lg:block'} top-0 left-0 z-50 h-full w-64 lg:w-full glass-sidebar transform transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:block lg:h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-white/10 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
        </div>

        {/* Navigation */}
        <nav 
          className="flex-1 px-4 py-6 space-y-3 overflow-y-auto h-full"
          role="navigation"
          aria-label="Menú de navegación"
        >
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* User info (mobile only) */}
        <div className="lg:hidden border-t border-white/10 p-4">
          <div className="glass-morphism rounded-2xl p-4" role="banner" aria-label="Información del usuario">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-morphism bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-gray-800 font-medium text-sm">
                  {user?.nombre_completo?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombre_completo || user?.email}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {user?.rol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;