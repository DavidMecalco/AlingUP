import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info',
  message,
  title,
  duration = 5000,
  onRemove,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        titleColor: 'text-green-900',
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        titleColor: 'text-red-900',
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        titleColor: 'text-yellow-900',
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        titleColor: 'text-blue-900',
      },
    };
    return configs[type] || configs.info;
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        max-w-sm w-full ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={`text-sm font-medium ${config.titleColor}`}>
                {title}
              </p>
            )}
            <p className={`text-sm ${config.textColor} ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
            
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className={`
                inline-flex ${config.textColor} hover:${config.titleColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${config.bgColor} focus:ring-${config.iconColor}
                rounded-md p-1.5 transition-colors duration-200
              `}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className={`h-1 ${config.bgColor} rounded-b-lg overflow-hidden`}>
          <div
            className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;