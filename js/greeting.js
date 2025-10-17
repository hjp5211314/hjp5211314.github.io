/**
 * Greeting Message
 * Display greeting message based on current time
 */
(function() {
  'use strict';

  const greetingConfig = GLOBAL_CONFIG.greeting;
  
  if (!greetingConfig || !greetingConfig.enable) {
    return;
  }

  function getGreetingMessage() {
    const currentHour = new Date().getHours();
    const messages = greetingConfig.message;
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (currentHour >= msg.start && currentHour <= msg.end) {
        return msg.content;
      }
    }
    
    return '你好👋';
  }

  function showGreeting() {
    const greetingBox = document.getElementById('greeting-box');
    if (!greetingBox) return;

    // Check if current page type is allowed
    const pageType = greetingBox.getAttribute('data-page-type');
    const allowedPages = greetingConfig.pages || ['index', 'post', 'page'];
    
    if (!allowedPages.includes(pageType)) {
      greetingBox.remove();
      return;
    }

    const message = getGreetingMessage();
    greetingBox.textContent = message;
    greetingBox.classList.add('show');

    // Auto hide after duration
    const duration = (greetingConfig.duration || 4) * 1000;
    setTimeout(() => {
      greetingBox.classList.remove('show');
      greetingBox.classList.add('hide');
      
      // Remove from DOM after animation
      setTimeout(() => {
        greetingBox.remove();
      }, 500);
    }, duration);
  }

  // Show greeting when page loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showGreeting);
  } else {
    showGreeting();
  }
})();
