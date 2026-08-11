/**
 * Universal Video Blocker - Content Script
 * Executed at `document_start` in ISOLATED world.
 * Manages domain/route checking, DOM mutation monitoring, and setting data attributes
 * for inject.js (MAIN world) to block videos without CSP inline script errors.
 */

(function () {
  'use strict';

  if (window.__universalVideoBlockerContentScriptLoaded) return;
  window.__universalVideoBlockerContentScriptLoaded = true;

  const DEFAULT_PLATFORMS = {
    youtube: ['youtube.com', 'youtu.be', 'googlevideo.com'],
    facebook: ['facebook.com', 'fb.watch', 'fbcdn.net'],
    instagram: ['instagram.com', 'cdninstagram.com'],
    tiktok: ['tiktok.com', 'tiktokcdn.com'],
    twitter: ['twitter.com', 'x.com', 'twimg.com'],
    twitch: ['twitch.tv', 'ttvnw.net'],
    reddit: ['reddit.com', 'v.redd.it'],
    vimeo: ['vimeo.com', 'vimeocdn.com'],
    dailymotion: ['dailymotion.com', 'dmcdn.net']
  };

  // Specific route patterns where video content is primary
  const VIDEO_ROUTES = [
    /\/reel\//i,
    /\/reels\//i,
    /\/watch/i,
    /\/shorts/i,
    /\/videos\//i,
    /\/story\.php/i,
    /\/tv\//i,
    /\/video\//i
  ];

  function isDomainMatch(hostname, domain) {
    if (!hostname || !domain) return false;
    hostname = hostname.toLowerCase();
    domain = domain.toLowerCase();
    return hostname === domain || hostname.endsWith('.' + domain);
  }

  function isSiteBlocked(hostname, settings) {
    if (!settings || settings.masterEnabled === false) return false;
    if (!hostname) return false;

    const platforms = settings.platforms || {};

    for (const key in DEFAULT_PLATFORMS) {
      if (platforms[key] !== false) {
        const domains = DEFAULT_PLATFORMS[key];
        for (let i = 0; i < domains.length; i++) {
          if (isDomainMatch(hostname, domains[i])) return true;
        }
      }
    }

    const customDomains = settings.customDomains || [];
    for (let i = 0; i < customDomains.length; i++) {
      if (isDomainMatch(hostname, customDomains[i])) return true;
    }

    return false;
  }

  let isActive = false;
  let purgeInterval = null;
  let domObserver = null;

  /**
   * SECTION 1: CSS FOR NON-DESTRUCTIVE VIDEO HIDING
   */
  const VIDEO_BLOCK_CSS = `
    video,
    object[type*="video"],
    embed[type*="video"],
    video-js,
    amp-video,
    plyr,
    jwplayer,
    ytd-player,
    .html5-main-video,
    .html5-video-container,
    .html5-video-player,
    .video-stream,
    iframe[src*="youtube.com/embed"],
    iframe[src*="youtube-nocookie.com"],
    iframe[src*="vimeo.com"],
    iframe[src*="dailymotion.com"],
    iframe[src*="player.twitch.tv"],
    iframe[src*="tiktok.com/embed"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

  function injectBlockingStyles() {
    if (document.getElementById('universal-video-blocker-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'universal-video-blocker-styles';
    styleEl.textContent = VIDEO_BLOCK_CSS;

    const parent = document.head || document.documentElement;
    if (parent) {
      parent.insertBefore(styleEl, parent.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        (document.head || document.documentElement).appendChild(styleEl);
      });
    }
  }

  function removeBlockingStyles() {
    const styleEl = document.getElementById('universal-video-blocker-styles');
    if (styleEl) styleEl.remove();
  }

  /**
   * SECTION 2: SAFELY PAUSE & MUTED VIDEO ELEMENTS
   */
  function destroyVideoElement(el) {
    if (!el) return;
    try {
      if (typeof el.pause === 'function') el.pause();
      el.muted = true;
      el.volume = 0;

      if (el.src && !el.src.startsWith('blob:')) {
        el.src = '';
        el.removeAttribute('src');
      }
      if (el.srcObject) {
        el.srcObject = null;
      }

      const sources = el.querySelectorAll ? el.querySelectorAll('source') : [];
      sources.forEach(src => {
        src.removeAttribute('src');
        src.removeAttribute('srcset');
        src.remove();
      });

      if (typeof el.load === 'function') el.load();
    } catch (e) {}
  }

  function purgeVideosFromTree(root) {
    if (!isActive || !root || !root.querySelectorAll) return;

    if (root.nodeType === Node.ELEMENT_NODE && root.matches && root.matches('video')) {
      destroyVideoElement(root);
      return;
    }

    const videos = root.querySelectorAll('video');
    videos.forEach(destroyVideoElement);

    const embeds = root.querySelectorAll('object[type*="video"], embed[type*="video"]');
    embeds.forEach(el => {
      try { destroyVideoElement(el); } catch (e) {}
    });
  }

  function observeDOMForVideos() {
    if (domObserver) return;
    domObserver = new MutationObserver(mutations => {
      if (!isActive) return;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const node = mutation.addedNodes[j];
            if (node.nodeType === Node.ELEMENT_NODE) {
              purgeVideosFromTree(node);
            }
          }
        }

        if (mutation.type === 'attributes' && mutation.target) {
          const target = mutation.target;
          if (target.nodeName === 'VIDEO' || (target.matches && target.matches('video'))) {
            destroyVideoElement(target);
          }
        }
      }
    });

    const targetNode = document.documentElement || document;
    domObserver.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'data-src']
    });
  }

  function startBlockerEngine() {
    if (isActive) return;
    isActive = true;

    if (document.documentElement) {
      document.documentElement.setAttribute('data-uvb-active', 'true');
    }

    injectBlockingStyles();
    purgeVideosFromTree(document);
    observeDOMForVideos();

    ['DOMContentLoaded', 'load', 'yt-navigate-finish', 'yt-page-data-updated', 'popstate', 'locationchange'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (isActive) purgeVideosFromTree(document);
      });
    });

    if (!purgeInterval) {
      purgeInterval = setInterval(() => {
        if (isActive) purgeVideosFromTree(document);
      }, 800);
    }
  }

  function stopBlockerEngine() {
    isActive = false;
    if (document.documentElement) {
      document.documentElement.setAttribute('data-uvb-active', 'false');
    }

    removeBlockingStyles();

    if (purgeInterval) {
      clearInterval(purgeInterval);
      purgeInterval = null;
    }
    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }
  }

  function checkAndApplySettings() {
    chrome.storage.local.get(['masterEnabled', 'platforms', 'customDomains'], (settings) => {
      const hostname = window.location.hostname || '';
      const shouldBlock = isSiteBlocked(hostname, settings);

      if (shouldBlock) {
        startBlockerEngine();
      } else {
        stopBlockerEngine();
      }
    });
  }

  // Initialize
  checkAndApplySettings();

  // Listen for live setting changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      checkAndApplySettings();
    }
  });

})();
