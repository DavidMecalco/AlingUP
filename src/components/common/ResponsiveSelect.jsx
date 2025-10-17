import React from 'react';
import { ChevronDown } from 'lucide-react';

const ResponsiveSelect = ({ 
  label,
  error,
  helperText,
  required = false,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  selectClassName = '',
  ...props 
}) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          className={`
            block w-full px-4 py-3 text-base
            border border-gray-300 rounded-lg
            bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-all duration-200
            touch-manipulation
            appearance-none
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${selectClassName}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
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

export default ResponsiveSelect;