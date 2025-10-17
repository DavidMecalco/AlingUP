import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
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
          <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">
            Portal de Tickets
          </h1>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.nombre_completo || user?.email}
            </span>
          </button>

          {/* Profile dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.nombre_completo}</div>
                  <div className="text-gray-500">{user?.email}</div>
                  <div className="text-xs text-primary-600 capitalize">{user?.rol}</div>
                </div>
                
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
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