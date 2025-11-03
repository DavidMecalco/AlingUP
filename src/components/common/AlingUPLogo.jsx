import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';

/**
 * AlingUP Logo Component with Liquid Glass Design
 * Displays the AlingUP brand logo with glass morphism effects
 */
const AlingUPLogo = ({ 
  size = 'md', 
  showIcon = true, 
  showText = true, 
  className = '',
  variant = 'default',
  animated = false
}) => {
  const sizeClasses = {
    xs: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      iconSize: 'w-3 h-3'
    },
    sm: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      iconSize: 'w-4 h-4'
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      iconSize: 'w-5 h-5'
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      iconSize: 'w-6 h-6'
    },
    xl: {
      icon: 'w-16 h-16',
      text: 'text-4xl',
      iconSize: 'w-8 h-8'
    }
  };

  const variantClasses = {
    default: {
      icon: 'glass-morphism bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-white/30',
      text: 'text-blue-600',
      textSecondary: 'text-gray-900',
      iconColor: 'text-blue-600'
    },
    light: {
      icon: 'glass-morphism bg-gradient-to-br from-white/20 to-white/10 border-white/40',
      text: 'text-white',
      textSecondary: 'text-white/90',
      iconColor: 'text-white'
    },
    dark: {
      icon: 'glass-strong bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-white/50',
      text: 'text-blue-700',
      textSecondary: 'text-gray-900',
      iconColor: 'text-blue-700'
    },
    glass: {
      icon: 'glass-card bg-gradient-to-br from-blue-500/15 to-emerald-500/15',
      text: 'text-blue-600',
      textSecondary: 'text-gray-900',
      iconColor: 'text-blue-600'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && (
        <div className={`
          ${currentSize.icon} 
          ${currentVariant.icon} 
          rounded-2xl 
          flex items-center justify-center 
          transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-glass-hover
          ${animated ? 'glass-float' : ''}
        `}>
          <Sparkles className={`${currentSize.iconSize} ${currentVariant.iconColor}`} />
        </div>
      )}
      
      {showText && (
        <h1 className={`font-bold ${currentSize.text} tracking-tight`}>
          <span className={`${currentVariant.text} transition-colors duration-300`}>
            Aling
          </span>
          <span className={`${currentVariant.textSecondary} transition-colors duration-300`}>
            UP
          </span>
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
  variant: PropTypes.oneOf(['default', 'light', 'dark', 'glass']),
  animated: PropTypes.bool
};

export default AlingUPLogo;