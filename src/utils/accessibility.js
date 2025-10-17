// Accessibility utility functions

/**
 * Generate a unique ID for form elements
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element) => {
  if (!element || element.disabled || element.hidden) return false;
  
  const focusableSelectors = [
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container) => {
  if (!container) return [];
  
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('hidden') &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    }
  );
};

/**
 * Trap focus within a container
 */
export const trapFocus = (container, event) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key !== 'Tab') return;

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }

  // Update the aria-live priority if different
  if (announcer.getAttribute('aria-live') !== priority) {
    announcer.setAttribute('aria-live', priority);
  }

  // Clear and set the message
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate ARIA attributes for a button
 */
export const getButtonAriaAttributes = (props = {}) => {
  const {
    isPressed,
    isExpanded,
    hasPopup,
    controls,
    describedBy,
    label,
    disabled,
  } = props;

  const attributes = {};

  if (typeof isPressed === 'boolean') {
    attributes['aria-pressed'] = isPressed;
  }

  if (typeof isExpanded === 'boolean') {
    attributes['aria-expanded'] = isExpanded;
  }

  if (hasPopup) {
    attributes['aria-haspopup'] = hasPopup;
  }

  if (controls) {
    attributes['aria-controls'] = controls;
  }

  if (describedBy) {
    attributes['aria-describedby'] = describedBy;
  }

  if (label) {
    attributes['aria-label'] = label;
  }

  if (disabled) {
    attributes['aria-disabled'] = true;
  }

  return attributes;
};

/**
 * Create a roving tabindex manager for lists
 */
export class RovingTabindexManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      selector: '[role="option"], [role="menuitem"], [role="tab"]',
      orientation: 'vertical', // 'vertical' | 'horizontal' | 'both'
      wrap: true,
      ...options,
    };
    
    this.currentIndex = 0;
    this.items = [];
    
    this.init();
  }

  init() {
    this.updateItems();
    this.setActiveItem(0);
    this.bindEvents();
  }

  updateItems() {
    this.items = Array.from(this.container.querySelectorAll(this.options.selector));
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });
  }

  setActiveItem(index) {
    if (index < 0 || index >= this.items.length) return;
    
    // Remove tabindex from current item
    if (this.items[this.currentIndex]) {
      this.items[this.currentIndex].setAttribute('tabindex', '-1');
    }
    
    // Set new active item
    this.currentIndex = index;
    if (this.items[this.currentIndex]) {
      this.items[this.currentIndex].setAttribute('tabindex', '0');
      this.items[this.currentIndex].focus();
    }
  }

  moveNext() {
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.items.length) {
      nextIndex = this.options.wrap ? 0 : this.items.length - 1;
    }
    this.setActiveItem(nextIndex);
  }

  movePrevious() {
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.options.wrap ? this.items.length - 1 : 0;
    }
    this.setActiveItem(prevIndex);
  }

  bindEvents() {
    this.container.addEventListener('keydown', (event) => {
      const { orientation } = this.options;
      
      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            this.moveNext();
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            this.movePrevious();
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            this.moveNext();
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            this.movePrevious();
          }
          break;
        case 'Home':
          event.preventDefault();
          this.setActiveItem(0);
          break;
        case 'End':
          event.preventDefault();
          this.setActiveItem(this.items.length - 1);
          break;
      }
    });

    // Update items when container changes
    const observer = new MutationObserver(() => {
      this.updateItems();
    });
    
    observer.observe(this.container, {
      childList: true,
      subtree: true,
    });
  }

  destroy() {
    // Clean up event listeners and observers
    // Implementation depends on specific needs
  }
}

/**
 * Color contrast utilities
 */
export const colorContrast = {
  // Calculate relative luminance
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG AA standards
  meetsWCAG_AA(color1, color2, isLargeText = false) {
    const ratio = this.getContrastRatio(color1, color2);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  // Check if contrast meets WCAG AAA standards
  meetsWCAG_AAA(color1, color2, isLargeText = false) {
    const ratio = this.getContrastRatio(color1, color2);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  },
};