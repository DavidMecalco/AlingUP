import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import TouchButton from './TouchButton';

const ErrorMessage = ({ 
  title = 'Error',
  message,
  error,
  onRetry,
  onDismiss,
  variant = 'default',
  className = ''
}) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-red-50 border-red-200 text-red-800',
      inline: 'bg-red-50 border-red-200 text-red-800 rounded-md p-3',
      banner: 'bg-red-600 text-white',
      card: 'bg-white border border-red-200 shadow-sm rounded-lg p-6',
    };
    return variants[variant] || variants.default;
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (variant === 'banner') {
    return (
      <div className={`${getVariantClasses()} ${className}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-3" />
            <div>
              <h3 className="font-medium">{title}</h3>
              {message && <p className="text-sm opacity-90">{message}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRetry && (
              <TouchButton
                onClick={onRetry}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reintentar
              </TouchButton>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-red-700 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${getVariantClasses()} ${className}`}>
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {message && (
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            )}
            
            {isDevelopment && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-auto">
                  {error.toString()}
                </pre>
              </details>
            )}
            
            {(onRetry || onDismiss) && (
              <div className="mt-4 flex space-x-3">
                {onRetry && (
                  <TouchButton
                    onClick={onRetry}
                    variant="primary"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reintentar
                  </TouchButton>
                )}
                
                {onDismiss && (
                  <TouchButton
                    onClick={onDismiss}
                    variant="outline"
                    size="sm"
                  >
                    Cerrar
                  </TouchButton>
                )}
              </div>
            )}
          </div>
          
          {onDismiss && variant !== 'card' && (
            <button
              onClick={onDismiss}
              className="ml-3 p-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`${getVariantClasses()} border rounded-md p-3 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && (
            <p className="mt-1 text-sm">{message}</p>
          )}
          
          {isDevelopment && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                Ver detalles
              </summary>
              <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
        
        <div className="ml-3 flex space-x-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
              title="Reintentar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;