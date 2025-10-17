import React, { forwardRef } from 'react';
import TouchButton from './TouchButton';

const AccessibleButton = forwardRef(({ 
  children,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  ariaHaspopup,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}, ref) => {
  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleKeyDown = (event) => {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  return (
    <TouchButton
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      loading={loading}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHaspopup}
      aria-disabled={disabled || loading}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </TouchButton>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;