import React from 'react';

const SkeletonLoader = ({ 
  variant = 'text',
  width = 'full',
  height = 'auto',
  className = '',
  lines = 1,
  animate = true
}) => {
  const getWidthClass = () => {
    if (typeof width === 'string') {
      const widthMap = {
        'full': 'w-full',
        '3/4': 'w-3/4',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '1/4': 'w-1/4',
      };
      return widthMap[width] || width;
    }
    return `w-[${width}]`;
  };

  const getHeightClass = () => {
    if (typeof height === 'string') {
      const heightMap = {
        'auto': '',
        'sm': 'h-4',
        'md': 'h-6',
        'lg': 'h-8',
        'xl': 'h-12',
      };
      return heightMap[height] || height;
    }
    return `h-[${height}]`;
  };

  const getVariantClasses = () => {
    const variants = {
      text: 'h-4 rounded',
      title: 'h-6 rounded',
      button: 'h-10 rounded-lg',
      card: 'h-32 rounded-lg',
      avatar: 'h-10 w-10 rounded-full',
      image: 'h-48 rounded-lg',
    };
    return variants[variant] || variants.text;
  };

  const baseClasses = `
    bg-gray-200
    ${animate ? 'animate-pulse' : ''}
    ${getWidthClass()}
    ${getHeightClass()}
    ${getVariantClasses()}
    ${className}
  `;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              ${baseClasses}
              ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            `}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClasses} />;
};

// Predefined skeleton components for common use cases
export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1">
          <SkeletonLoader variant="title" width="1/2" className="mb-2" />
          <SkeletonLoader variant="text" width="1/3" />
        </div>
      </div>
      <SkeletonLoader variant="text" lines={3} className="mb-4" />
      <div className="flex space-x-2">
        <SkeletonLoader variant="button" width="20" />
        <SkeletonLoader variant="button" width="24" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonLoader key={index} variant="text" width="3/4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="text" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1">
          <SkeletonLoader variant="title" width="1/2" className="mb-2" />
          <SkeletonLoader variant="text" width="3/4" />
        </div>
        <SkeletonLoader variant="button" width="20" />
      </div>
    ))}
  </div>
);

export default SkeletonLoader;