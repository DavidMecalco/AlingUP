import PropTypes from 'prop-types';

/**
 * AlingUP Logo Component
 * Displays the AlingUP brand logo with consistent styling
 */
const AlingUPLogo = ({ 
  size = 'md', 
  showIcon = true, 
  showText = true, 
  className = '',
  variant = 'default' 
}) => {
  const sizeClasses = {
    xs: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      iconText: 'text-xs'
    },
    sm: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      iconText: 'text-sm'
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      iconText: 'text-sm'
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      iconText: 'text-base'
    },
    xl: {
      icon: 'w-16 h-16',
      text: 'text-4xl',
      iconText: 'text-lg'
    }
  };

  const variantClasses = {
    default: {
      icon: 'bg-gradient-to-br from-purple-600 to-indigo-600',
      text: 'text-purple-600',
      textSecondary: 'text-gray-900'
    },
    light: {
      icon: 'bg-gradient-to-br from-purple-100 to-indigo-100',
      text: 'text-purple-100',
      textSecondary: 'text-white'
    },
    dark: {
      icon: 'bg-gradient-to-br from-purple-800 to-indigo-800',
      text: 'text-purple-800',
      textSecondary: 'text-gray-800'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && (
        <div className={`${currentSize.icon} ${currentVariant.icon} rounded-lg flex items-center justify-center shadow-sm`}>
          <span className={`text-white font-bold ${currentSize.iconText}`}>
            AU
          </span>
        </div>
      )}
      
      {showText && (
        <h1 className={`font-bold ${currentSize.text}`}>
          <span className={currentVariant.text}>Aling</span>
          <span className={currentVariant.textSecondary}>UP</span>
        </h1>
      )}
    </div>
  );
};

AlingUPLogo.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  showIcon: PropTypes.bool,
  showText: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'light', 'dark'])
};

export default AlingUPLogo;