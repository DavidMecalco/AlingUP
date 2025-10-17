import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useFocusManagement from '../../hooks/useFocusManagement';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import AccessibleButton from './AccessibleButton';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const { containerRef } = useFocusManagement({
    autoFocus: isOpen,
    restoreFocus: true,
    trapFocus: isOpen,
  });

  useKeyboardNavigation({
    onEscape: closeOnEscape ? onClose : undefined,
    enabled: isOpen,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    };
    return sizes[size] || sizes.md;
  };

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={containerRef}
          className={`
            relative w-full ${getSizeClasses()} 
            bg-white rounded-lg shadow-xl 
            transform transition-all duration-200
            ${className}
          `}
          {...props}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              
              {onClose && (
                <AccessibleButton
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  ariaLabel="Cerrar modal"
                  className="ml-auto"
                >
                  <X className="h-5 w-5" />
                </AccessibleButton>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;