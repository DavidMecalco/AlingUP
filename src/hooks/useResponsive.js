import { useState, useEffect } from 'react';

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine current breakpoint
      if (width < 475) {
        setBreakpoint('xs');
      } else if (width < 640) {
        setBreakpoint('sm');
      } else if (width < 768) {
        setBreakpoint('md');
      } else if (width < 1024) {
        setBreakpoint('lg');
      } else if (width < 1280) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('2xl');
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;
  const isLargeScreen = screenSize.width >= 1280;

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
  };
};

export default useResponsive;