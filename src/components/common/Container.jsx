import React from 'react';

const Container = ({ 
  children, 
  size = 'default',
  padding = 'default',
  className = '' 
}) => {
  const getSizeClasses = () => {
    const sizeMap = {
      'sm': 'max-w-2xl',
      'default': 'max-w-7xl',
      'lg': 'max-w-8xl',
      'xl': 'max-w-9xl',
      'full': 'max-w-full',
    };
    return sizeMap[size] || sizeMap.default;
  };

  const getPaddingClasses = () => {
    const paddingMap = {
      'none': '',
      'sm': 'px-4 sm:px-6',
      'default': 'px-4 sm:px-6 lg:px-8',
      'lg': 'px-6 sm:px-8 lg:px-12',
    };
    return paddingMap[padding] || paddingMap.default;
  };

  return (
    <div className={`mx-auto ${getSizeClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default Container;