import { useEffect, useCallback } from 'react';

const useKeyboardNavigation = (options = {}) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    enabled = true,
    preventDefault = true,
  } = options;

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const { key, shiftKey } = event;

    switch (key) {
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape(event);
        }
        break;
      
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          onEnter(event);
        }
        break;
      
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          onArrowUp(event);
        }
        break;
      
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          onArrowDown(event);
        }
        break;
      
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          onArrowLeft(event);
        }
        break;
      
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          onArrowRight(event);
        }
        break;
      
      case 'Tab':
        if (shiftKey && onShiftTab) {
          if (preventDefault) event.preventDefault();
          onShiftTab(event);
        } else if (!shiftKey && onTab) {
          if (preventDefault) event.preventDefault();
          onTab(event);
        }
        break;
      
      default:
        break;
    }
  }, [
    enabled,
    preventDefault,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return { handleKeyDown };
};

export default useKeyboardNavigation;