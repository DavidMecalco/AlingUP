import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  text = null 
}) => {
  const getSizeClasses = () => {
    const sizes = {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };
    return sizes[size] || sizes.md;
  };

  const getColorClasses = () => {
    const colors = {
      primary: 'text-primary-600',
      gray: 'text-gray-600',
      white: 'text-white',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}
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
      {text && (
        <p className={`mt-2 text-sm ${getColorClasses()}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;