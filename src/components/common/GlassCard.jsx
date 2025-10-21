import PropTypes from 'prop-types';
import '../../styles/glass.css';

/**
 * Glass Card Component with Liquid Glass Design
 * A reusable card component with glass morphism effects
 */
const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md',
  onClick,
  ...props 
}) => {
  const variantClasses = {
    default: 'glass-card',
    light: 'glass-morphism bg-white/10',
    dark: 'glass-morphism-dark',
    primary: 'glass-morphism bg-gradient-to-br from-purple-500/10 to-indigo-500/10',
    success: 'glass-morphism bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    warning: 'glass-morphism bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
    error: 'glass-morphism bg-gradient-to-br from-red-500/10 to-pink-500/10',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-glass-hover' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${clickableClasses}
        transition-all duration-300 ease-out
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'light', 'dark', 'primary', 'success', 'warning', 'error']),
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  onClick: PropTypes.func,
};

export default GlassCard;