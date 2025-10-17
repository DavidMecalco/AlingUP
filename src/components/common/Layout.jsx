import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SkipLink from './SkipLink';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for keyboard navigation */}
      <SkipLink />
      
      {/* Header */}
      <Header 
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />

        {/* Main content */}
        <main 
          id="main-content"
          className="flex-1 overflow-auto"
          role="main"
          aria-label="Contenido principal"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;