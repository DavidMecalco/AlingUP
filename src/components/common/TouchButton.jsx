import React from 'react';

const TouchButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
      outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[2.5rem]',
      md: 'px-4 py-3 text-sm min-h-[3rem]',
      lg: 'px-6 py-4 text-base min-h-[3.5rem]',
      xl: 'px-8 py-5 text-lg min-h-[4rem]',
    };
    return sizes[size] || sizes.md;
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    touch-manipulation
    select-none
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default TouchButton;