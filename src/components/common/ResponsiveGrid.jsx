import React from 'react';

const ResponsiveGrid = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'gap-4',
  className = ''
}) => {
  const getGridCols = () => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };

    const classes = [];
    
    if (cols.xs) classes.push(colsMap[cols.xs]);
    if (cols.sm) classes.push(`sm:${colsMap[cols.sm]}`);
    if (cols.md) classes.push(`md:${colsMap[cols.md]}`);
    if (cols.lg) classes.push(`lg:${colsMap[cols.lg]}`);
    if (cols.xl) classes.push(`xl:${colsMap[cols.xl]}`);
    if (cols['2xl']) classes.push(`2xl:${colsMap[cols['2xl']]}`);

    return classes.join(' ');
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;