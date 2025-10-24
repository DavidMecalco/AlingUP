import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SkipLink from './SkipLink';
import '../../styles/glass.css';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Floating Glass Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Skip link for keyboard navigation */}
        <SkipLink />
        
        {/* Header */}
        <Header 
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <Sidebar 
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          />

          {/* Main content */}
          <main 
            id="main-content"
            className="flex-1 lg:ml-0"
            role="main"
            aria-label="Contenido principal"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;