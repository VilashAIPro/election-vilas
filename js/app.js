
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-VOTEIQ2024');
  /** @param {string} eventName @param {Object} params */
  function trackEvent(eventName, params) {
    try { gtag('event', eventName, params); } catch(e) { console.warn('Analytics error:', e); }
  }

