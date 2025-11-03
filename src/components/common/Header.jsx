import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import AlingUPLogo from './AlingUPLogo';
import '../../styles/glass.css';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    try {
      console.log('Attempting to logout...');
      await signOut();
      console.log('Logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden glass-button p-2 rounded-xl text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Logo/Title */}
        <div className="flex items-center">
          <AlingUPLogo size="sm" variant="dark" className="ml-2 lg:ml-0" />
        </div>

        {/* User menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="glass-button flex items-center space-x-3 p-3 rounded-2xl text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
            aria-label="Menú de usuario"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-8 h-8 glass-morphism bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
              <User className="h-4 w-4 text-gray-800" />
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.nombre_completo || user?.email}
            </span>
          </button>

          {/* Profile dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 z-50 glass-modal animate-scale-in shadow-2xl">
                <div className="p-2">
                  <div className="px-4 py-3 border-b border-white/30">
                    <div className="font-medium text-gray-900">{user?.nombre_completo}</div>
                    <div className="text-gray-700 text-sm">{user?.email}</div>
                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-medium mt-2 capitalize">
                      {user?.rol}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      // TODO: Navigate to settings page
                      console.log('Navigate to settings')
                    }}
                    className="glass-button flex items-center w-full px-4 py-3 text-sm text-gray-800 hover:text-gray-900 hover:bg-white/50 rounded-xl mt-2 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configuración
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      handleLogout()
                    }}
                    className="glass-button flex items-center w-full px-4 py-3 text-sm text-gray-800 hover:text-gray-900 hover:bg-red-100 rounded-xl mt-1 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;