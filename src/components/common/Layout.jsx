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
      {/* Animated Background - Optimized White Theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        {/* Strong texture overlay for better contrast */}
        <div className="absolute inset-0 bg-white/70"></div>
        
        {/* Floating Glass Orbs - Very subtle */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/6 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-indigo-400/4 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-emerald-400/4 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-slate-400/4 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s'}}></div>
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
          {/* Sidebar - Fixed positioning to prevent cutting */}
          <aside className="hidden lg:block fixed top-16 left-0 w-56 h-[calc(100vh-4rem)] overflow-y-auto z-30">
            <Sidebar 
              isOpen={false}
              onClose={closeMobileMenu}
            />
          </aside>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMobileMenu}></div>
              <div className="relative w-64 flex-shrink-0">
                <Sidebar 
                  isOpen={isMobileMenuOpen}
                  onClose={closeMobileMenu}
                />
              </div>
            </div>
          )}

          {/* Main content - Adjusted margin for sidebar */}
          <main 
            id="main-content"
            className="flex-1 min-w-0 lg:ml-56 overflow-x-hidden"
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