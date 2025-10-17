import React from 'react';

const SkipLink = ({ href = '#main-content', children = 'Saltar al contenido principal' }) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        absolute top-4 left-4 z-50
        bg-primary-600 text-white
        px-4 py-2 rounded-md
        font-medium text-sm
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all duration-200
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;