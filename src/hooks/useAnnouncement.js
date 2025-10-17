import { useCallback } from 'react';

const useAnnouncement = () => {
  const announce = useCallback((message, priority = 'polite') => {
    // Create or get existing announcement element
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
  }, []);

  const announcePolite = useCallback((message) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive,
  };
};

export default useAnnouncement;