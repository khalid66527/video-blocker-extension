/**
 * Universal Video Blocker - Main World Script
 * Executed in MAIN world at `document_start` via manifest.json.
 * Avoids any CSP inline script injection issues.
 */

(function () {
  'use strict';

  if (window.__uvbMainWorldActive) return;
  window.__uvbMainWorldActive = true;

  function isBlocked() {
    return document.documentElement && document.documentElement.getAttribute('data-uvb-active') === 'true';
  }

  function killMediaElement(el) {
    if (!el || !isBlocked()) return;
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
      for (let i = 0; i < sources.length; i++) {
        sources[i].removeAttribute('src');
        sources[i].removeAttribute('srcset');
        sources[i].remove();
      }
      if (typeof el.load === 'function') el.load();
    } catch (e) {}
  }

  const disableMediaSource = function (OrigMediaSource) {
    if (!OrigMediaSource) return null;
    function BlockedMediaSource(a, b, c) {
      if (isBlocked()) {
        throw new Error('MediaSource playback blocked by Universal Video Blocker');
      }
      return new OrigMediaSource(a, b, c);
    }
    BlockedMediaSource.isTypeSupported = function (type) {
      if (isBlocked() && type && (type.includes('video') || type.includes('mp4') || type.includes('webm') || type.includes('avc1'))) {
        return false;
      }
      return OrigMediaSource.isTypeSupported ? OrigMediaSource.isTypeSupported(type) : false;
    };
    return BlockedMediaSource;
  };

  if (window.MediaSource) {
    try {
      const OrigMS = window.MediaSource;
      window.MediaSource = disableMediaSource(OrigMS);
    } catch (e) {}
  }
  if (window.WebKitMediaSource) {
    try {
      const OrigWKMS = window.WebKitMediaSource;
      window.WebKitMediaSource = disableMediaSource(OrigWKMS);
    } catch (e) {}
  }

  try {
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (isBlocked()) {
        const isVideo = this.tagName === 'VIDEO' || (this.src && (this.src.includes('video') || this.src.includes('.mp4') || this.src.includes('.webm') || this.src.includes('googlevideo')));
        if (isVideo || !this.tagName || this.tagName === 'VIDEO') {
          killMediaElement(this);
          return Promise.reject(new DOMException('Video playback disabled by Universal Video Blocker', 'NotAllowedError'));
        }
      }
      return origPlay.apply(this, arguments);
    };
  } catch (e) {}

  try {
    const origLoad = HTMLMediaElement.prototype.load;
    HTMLMediaElement.prototype.load = function () {
      if (isBlocked() && (this.tagName === 'VIDEO' || !this.tagName)) {
        killMediaElement(this);
        return;
      }
      return origLoad.apply(this, arguments);
    };
  } catch (e) {}

  try {
    const origCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function (object) {
      if (isBlocked() && object && (object instanceof Blob || (window.MediaSource && object instanceof MediaSource))) {
        const type = object.type || '';
        if (type.includes('video') || type.includes('media') || type.includes('mp4') || type.includes('webm') || object instanceof MediaSource) {
          return 'about:blank';
        }
      }
      return origCreateObjectURL.call(this, object);
    };
  } catch (e) {}

})();
