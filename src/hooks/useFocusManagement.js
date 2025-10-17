import { useRef, useEffect, useCallback } from 'react';

const useFocusManagement = (options = {}) => {
  const {
    autoFocus = false,
    restoreFocus = false,
    trapFocus = false,
  } = options;

  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }
  }, [restoreFocus]);

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const focusableElement = getFocusableElements(containerRef.current)[0];
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [autoFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  // Focus trap
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const focusableElement = getFocusableElements(containerRef.current)[0];
      focusableElement?.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      const lastElement = focusableElements[focusableElements.length - 1];
      lastElement?.focus();
    }
  }, []);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
};

// Helper function to get focusable elements
const getFocusableElements = (container) => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('hidden')
      );
    }
  );
};

export default useFocusManagement;