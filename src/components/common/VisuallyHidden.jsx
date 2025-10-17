import React from 'react';

const VisuallyHidden = ({ children, as: Component = 'span', ...props }) => {
  return (
    <Component
      className="sr-only"
      {...props}
    >
      {children}
    </Component>
  );
};

export default VisuallyHidden;