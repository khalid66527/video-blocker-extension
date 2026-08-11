/**
 * Universal Video Blocker - Content Script
 * 
 * Executed at `document_start` across frames.
 * Checks user settings from storage to selectively activate video blocking only on
 * enabled platforms (YouTube, Facebook, Instagram, TikTok, etc.) or user-added custom domains.
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
   * SECTION 1: MAIN WORLD JS INJECTION
   */
  function injectMainWorldEngine() {
    if (window.__uvbMainWorldScriptInjected) return;
    window.__uvbMainWorldScriptInjected = true;

    const code = `(${function () {
      if (window.__uvbMainWorldActive) return;
      window.__uvbMainWorldActive = true;

      function killMediaElement(el) {
        if (!el) return;
        try {
          if (typeof el.pause === 'function') el.pause();
          el.muted = true;
          el.volume = 0;
          if (el.src) {
            el.src = '';
            el.removeAttribute('src');
          }
          if (el.srcObject) {
            el.srcObject = null;
          }
          const sources = el.querySelectorAll ? el.querySelectorAll('source') : [];
          for (let i = 0; i < sources.length; i++) {
            sources[i].removeAttribute('src');
            sources[i].remove();
          }
          if (typeof el.load === 'function') el.load();
          if (el.parentNode) el.parentNode.removeChild(el);
        } catch (e) {}
      }

      const disableMediaSource = function () {
        function BlockedMediaSource() {
          throw new Error('MediaSource disabled by Universal Video Blocker');
        }
        BlockedMediaSource.isTypeSupported = function () { return false; };
        return BlockedMediaSource;
      };

      if (window.MediaSource) {
        try { window.MediaSource = disableMediaSource(); } catch (e) {}
      }
      if (window.WebKitMediaSource) {
        try { window.WebKitMediaSource = disableMediaSource(); } catch (e) {}
      }

      try {
        HTMLMediaElement.prototype.play = function () {
          killMediaElement(this);
          return Promise.reject(new DOMException('Video playback disabled by Universal Video Blocker', 'NotAllowedError'));
        };
      } catch (e) {}

      try {
        HTMLMediaElement.prototype.load = function () {
          killMediaElement(this);
        };
      } catch (e) {}

      try {
        const origCreateObjectURL = URL.createObjectURL;
        URL.createObjectURL = function (object) {
          if (object && (object instanceof Blob || (window.MediaSource && object instanceof MediaSource))) {
            const type = object.type || '';
            if (type.includes('video') || type.includes('media') || type.includes('mp4') || type.includes('webm') || object instanceof MediaSource) {
              return 'about:blank';
            }
          }
          return origCreateObjectURL.call(this, object);
        };
      } catch (e) {}

      try {
        const origAttachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (init) {
          const shadowRoot = origAttachShadow.call(this, init);
          if (shadowRoot) {
            const observer = new MutationObserver(mutations => {
              for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                if (mutation.addedNodes) {
                  for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.nodeName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
                      killMediaElement(node.nodeName === 'VIDEO' ? node : node.querySelector('video'));
                    }
                  }
                }
              }
            });
            observer.observe(shadowRoot, { childList: true, subtree: true });
          }
          return shadowRoot;
        };
      } catch (e) {}

    }})();`;

    const scriptEl = document.createElement('script');
    scriptEl.textContent = code;
    const parent = document.head || document.documentElement;
    if (parent) {
      parent.insertBefore(scriptEl, parent.firstChild);
      scriptEl.remove();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        (document.head || document.documentElement).appendChild(scriptEl);
        scriptEl.remove();
      });
    }
  }

  /**
   * SECTION 2: DYNAMIC CSS BLOCKING RULES
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
    ytd-watch-flexy video,
    .html5-main-video,
    .html5-video-container,
    .html5-video-player,
    .video-stream,
    #movie_player,
    [aria-label*="video" i],
    [data-testid*="video" i],
    [class*="video-player" i],
    [class*="VideoPlayer" i],
    iframe[src*="youtube.com"],
    iframe[src*="youtube-nocookie.com"],
    iframe[src*="vimeo.com"],
    iframe[src*="dailymotion.com"],
    iframe[src*="player.twitch.tv"],
    iframe[src*="tiktok.com/embed"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0px !important;
      height: 0px !important;
      max-width: 0px !important;
      max-height: 0px !important;
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
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

  /**
   * SECTION 3: DOM DESTRUCTION AND OBSERVER
   */
  function destroyVideoElement(el) {
    if (!el) return;
    try {
      if (typeof el.pause === 'function') el.pause();
      el.muted = true;
      el.volume = 0;

      if (el.src) {
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

      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
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
      try { el.remove(); } catch (e) {}
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

    injectMainWorldEngine();
    injectBlockingStyles();
    purgeVideosFromTree(document);
    observeDOMForVideos();

    ['DOMContentLoaded', 'load', 'yt-navigate-finish', 'yt-page-data-updated', 'popstate'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (isActive) purgeVideosFromTree(document);
      });
    });

    if (!purgeInterval) {
      purgeInterval = setInterval(() => {
        if (isActive) purgeVideosFromTree(document);
      }, 1000);
    }
  }

  function stopBlockerEngine() {
    isActive = false;
    const styleEl = document.getElementById('universal-video-blocker-styles');
    if (styleEl) styleEl.remove();

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
