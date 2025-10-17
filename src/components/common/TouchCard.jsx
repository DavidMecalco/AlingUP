import React from 'react';

const TouchCard = ({ 
  children, 
  onClick,
  className = '',
  padding = 'default',
  shadow = 'default',
  hover = true,
  ...props 
}) => {
  const getPaddingClasses = () => {
    const paddingMap = {
      'none': '',
      'sm': 'p-3',
      'default': 'p-4 sm:p-6',
      'lg': 'p-6 sm:p-8',
    };
    return paddingMap[padding] || paddingMap.default;
  };

  const getShadowClasses = () => {
    const shadowMap = {
      'none': '',
      'sm': 'shadow-sm',
      'default': 'shadow-md',
      'lg': 'shadow-lg',
    };
    return shadowMap[shadow] || shadowMap.default;
  };

  const baseClasses = `
    bg-white rounded-lg border border-gray-200
    ${getShadowClasses()}
    ${getPaddingClasses()}
    ${onClick ? 'cursor-pointer touch-manipulation select-none' : ''}
    ${hover && onClick ? 'hover:shadow-lg hover:border-gray-300 active:scale-[0.98]' : ''}
    transition-all duration-200 ease-in-out
    ${className}
  `;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default TouchCard;