import React from 'react';

const ResponsiveInput = ({ 
  label,
  error,
  helperText,
  required = false,
  className = '',
  inputClassName = '',
  ...props 
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`
          block w-full px-4 py-3 text-base
          border border-gray-300 rounded-lg
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-all duration-200
          touch-manipulation
          ${error ? 'border-red-300 focus:ring-red-500' : ''}
          ${inputClassName}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default ResponsiveInput;