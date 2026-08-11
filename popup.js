/**
 * Universal Video Blocker - Popup Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Platform definitions with SVG icons
  const PLATFORMS_DATA = {
    youtube: {
      name: 'YouTube',
      domains: ['youtube.com', 'youtu.be'],
      svg: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    facebook: {
      name: 'Facebook',
      domains: ['facebook.com', 'fb.watch'],
      svg: `<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    },
    instagram: {
      name: 'Instagram',
      domains: ['instagram.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
    },
    tiktok: {
      name: 'TikTok',
      domains: ['tiktok.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#00F2FE"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.14V9.3a6.34 6.34 0 0 0-5.07 6.19 6.34 6.34 0 1 0 11.41-3.83V9.07a8.26 8.26 0 0 0 4.77 1.52V7.14a4.85 4.85 0 0 1-1-.45z"/></svg>`
    },
    twitter: {
      name: 'Twitter / X',
      domains: ['twitter.com', 'x.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/></svg>`
    },
    twitch: {
      name: 'Twitch',
      domains: ['twitch.tv'],
      svg: `<svg viewBox="0 0 24 24" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.571zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`
    },
    reddit: {
      name: 'Reddit',
      domains: ['reddit.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.196-.491.956 0 1.733.777 1.733 1.733 0 .658-.363 1.222-.894 1.517.01.143.018.288.018.434 0 2.92-3.23 5.289-7.214 5.289-3.983 0-7.213-2.368-7.213-5.289 0-.142.008-.285.016-.425A1.733 1.733 0 0 1 3.8 11.977c0-.956.777-1.733 1.733-1.733.454 0 .866.175 1.171.46 1.173-.836 2.802-1.393 4.604-1.478l.926-4.338 3.197.674a1.25 1.25 0 0 1 .58-.118zM9.544 14.5c-.752 0-1.36.608-1.36 1.36 0 .752.608 1.36 1.36 1.36s1.36-.608 1.36-1.36c0-.752-.608-1.36-1.36-1.36zm4.912 0c-.752 0-1.36.608-1.36 1.36 0 .752.608 1.36 1.36 1.36s1.36-.608 1.36-1.36c0-.752-.608-1.36-1.36-1.36z"/></svg>`
    },
    vimeo: {
      name: 'Vimeo',
      domains: ['vimeo.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#1AB7EA"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L4.322 7.643C3.593 4.978 2.76 3.645 1.815 3.645c-.21 0-.943.443-2.203 1.328L0 3.686C1.498 2.373 2.977 1.058 4.437.039c1.611-1.121 2.822-1.018 3.633.311.892 1.458 1.516 4.708 1.868 9.75.529 7.575 1.287 11.362 2.274 11.362.775 0 1.947-1.258 3.518-3.775 1.571-2.518 2.394-4.43 2.47-5.736.148-2.247-1.042-3.37-3.568-3.37-1.196 0-2.394.275-3.593.824 1.472-4.819 4.269-7.228 8.391-7.228 3.037 0 4.54 1.48 4.54 4.44z"/></svg>`
    },
    dailymotion: {
      name: 'Dailymotion',
      domains: ['dailymotion.com'],
      svg: `<svg viewBox="0 0 24 24" fill="#0066DC"><path d="M12.012 2A10.012 10.012 0 0 0 2 12.012 10.012 10.012 0 0 0 12.012 22 10.012 10.012 0 0 0 22 12.012 10.012 10.012 0 0 0 12.012 2zm3.328 14.17h-2.148v-1.12a3.86 3.86 0 0 1-2.73 1.18 3.99 3.99 0 0 1-3.96-4.04 3.99 3.99 0 0 1 3.96-4.04c1.07 0 2.05.44 2.73 1.18V5.37h2.148v10.8z"/></svg>`
    }
  };

  // State
  let state = {
    masterEnabled: true,
    platforms: {
      youtube: true,
      facebook: true,
      instagram: true,
      tiktok: true,
      twitter: true,
      twitch: true,
      reddit: true,
      vimeo: true,
      dailymotion: true
    },
    customDomains: []
  };

  let currentHostname = '';

  // Elements
  const masterToggle = document.getElementById('master-toggle');
  const masterStatusBar = document.getElementById('master-status-bar');
  const masterStatusText = document.getElementById('master-status-text');
  const currentHostnameEl = document.getElementById('current-hostname');
  const quickToggleBtn = document.getElementById('quick-toggle-btn');
  const quickToggleText = document.getElementById('quick-toggle-text');
  const platformsGrid = document.getElementById('platforms-grid');
  const platformSearchInput = document.getElementById('platform-search');
  const addDomainForm = document.getElementById('add-domain-form');
  const customDomainInput = document.getElementById('custom-domain-input');
  const customDomainsList = document.getElementById('custom-domains-list');
  const activeSummaryEl = document.getElementById('active-summary');

  function isDomainMatch(hostname, domain) {
    if (!hostname || !domain) return false;
    hostname = hostname.toLowerCase();
    domain = domain.toLowerCase();
    return hostname === domain || hostname.endsWith('.' + domain);
  }

  function isHostnameBlocked(hostname) {
    if (!state.masterEnabled || !hostname) return false;

    // Check platforms
    for (const key in PLATFORMS_DATA) {
      if (state.platforms[key] !== false) {
        const domains = PLATFORMS_DATA[key].domains;
        for (let i = 0; i < domains.length; i++) {
          if (isDomainMatch(hostname, domains[i])) return true;
        }
      }
    }

    // Check custom domains
    for (let i = 0; i < state.customDomains.length; i++) {
      if (isDomainMatch(hostname, state.customDomains[i])) return true;
    }

    return false;
  }

  function findPlatformKeyForHostname(hostname) {
    if (!hostname) return null;
    for (const key in PLATFORMS_DATA) {
      const domains = PLATFORMS_DATA[key].domains;
      for (let i = 0; i < domains.length; i++) {
        if (isDomainMatch(hostname, domains[i])) return key;
      }
    }
    return null;
  }

  function updateMasterUI() {
    masterToggle.checked = state.masterEnabled;
    if (state.masterEnabled) {
      masterStatusBar.className = 'status-bar active';
      masterStatusText.textContent = 'Video Blocker is Active';
    } else {
      masterStatusBar.className = 'status-bar disabled';
      masterStatusText.textContent = 'Video Blocker is Disabled (Paused)';
    }
  }

  function updateCurrentSiteUI() {
    if (!currentHostname || currentHostname.startsWith('chrome') || currentHostname === 'Detecting site...') {
      currentHostnameEl.textContent = 'Extension Page';
      quickToggleBtn.style.display = 'none';
      return;
    }

    currentHostnameEl.textContent = currentHostname;
    quickToggleBtn.style.display = 'inline-block';

    const blocked = isHostnameBlocked(currentHostname);
    if (blocked) {
      quickToggleBtn.className = 'quick-toggle-btn block-mode';
      quickToggleText.textContent = '🛡️ Blocked';
    } else {
      quickToggleBtn.className = 'quick-toggle-btn allowed-mode';
      quickToggleText.textContent = '▶ Allowed';
    }
  }

  function renderPlatforms(filterQuery = '') {
    platformsGrid.innerHTML = '';
    const query = filterQuery.toLowerCase().trim();

    Object.keys(PLATFORMS_DATA).forEach(key => {
      const p = PLATFORMS_DATA[key];
      if (query && !p.name.toLowerCase().includes(query) && !p.domains.some(d => d.includes(query))) {
        return;
      }

      const isChecked = state.platforms[key] !== false;

      const card = document.createElement('div');
      card.className = 'platform-card';

      card.innerHTML = `
        <div class="platform-left">
          <div class="platform-icon">${p.svg}</div>
          <div class="platform-meta">
            <span class="platform-name">${p.name}</span>
            <span class="platform-domains">${p.domains.join(', ')}</span>
          </div>
        </div>
        <div class="platform-right">
          <span class="status-badge ${isChecked ? 'badge-on' : 'badge-off'}">${isChecked ? 'On' : 'Off'}</span>
          <label class="switch">
            <input type="checkbox" data-platform="${key}" ${isChecked ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
        </div>
      `;

      platformsGrid.appendChild(card);
    });

    // Add toggle listeners
    platformsGrid.querySelectorAll('input[data-platform]').forEach(input => {
      input.addEventListener('change', (e) => {
        const pKey = e.target.getAttribute('data-platform');
        const isChecked = e.target.checked;
        state.platforms[pKey] = isChecked;

        const badge = e.target.closest('.platform-right').querySelector('.status-badge');
        if (badge) {
          badge.textContent = isChecked ? 'On' : 'Off';
          badge.className = `status-badge ${isChecked ? 'badge-on' : 'badge-off'}`;
        }

        saveState();
      });
    });
  }

  function renderCustomDomains() {
    customDomainsList.innerHTML = '';

    if (!state.customDomains || state.customDomains.length === 0) {
      customDomainsList.innerHTML = '<span class="empty-state">No custom site domains added yet.</span>';
      return;
    }

    state.customDomains.forEach((domain, index) => {
      const chip = document.createElement('div');
      chip.className = 'domain-chip';
      chip.innerHTML = `
        <span>${domain}</span>
        <button type="button" class="remove-btn" data-index="${index}" title="Remove domain">&times;</button>
      `;
      customDomainsList.appendChild(chip);
    });

    customDomainsList.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        state.customDomains.splice(index, 1);
        saveState();
      });
    });
  }

  function updateFooterSummary() {
    let count = 0;
    Object.keys(PLATFORMS_DATA).forEach(k => {
      if (state.platforms[k] !== false) count++;
    });
    count += (state.customDomains || []).length;
    activeSummaryEl.textContent = `Active blocking on ${count} source${count === 1 ? '' : 's'}`;
  }

  function saveState() {
    chrome.storage.local.set({
      masterEnabled: state.masterEnabled,
      platforms: state.platforms,
      customDomains: state.customDomains
    }, () => {
      updateMasterUI();
      updateCurrentSiteUI();
      renderCustomDomains();
      updateFooterSummary();
    });
  }

  function loadState() {
    chrome.storage.local.get(['masterEnabled', 'platforms', 'customDomains'], (result) => {
      if (result.masterEnabled !== undefined) state.masterEnabled = result.masterEnabled;
      if (result.platforms) state.platforms = result.platforms;
      if (result.customDomains) state.customDomains = result.customDomains;

      updateMasterUI();
      renderPlatforms();
      renderCustomDomains();
      updateFooterSummary();
      detectCurrentTab();
    });
  }

  function detectCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          currentHostname = url.hostname;
        } catch (e) {
          currentHostname = '';
        }
      }
      updateCurrentSiteUI();
    });
  }

  // Event Listeners
  masterToggle.addEventListener('change', (e) => {
    state.masterEnabled = e.target.checked;
    saveState();
  });

  platformSearchInput.addEventListener('input', (e) => {
    renderPlatforms(e.target.value);
  });

  addDomainForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let raw = customDomainInput.value.trim().toLowerCase();
    if (!raw) return;

    // Clean URL to domain
    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];

    if (raw && !state.customDomains.includes(raw)) {
      state.customDomains.push(raw);
      customDomainInput.value = '';
      saveState();
    }
  });

  quickToggleBtn.addEventListener('click', () => {
    if (!currentHostname) return;

    const platformKey = findPlatformKeyForHostname(currentHostname);

    if (platformKey) {
      // Toggle platform
      state.platforms[platformKey] = !state.platforms[platformKey];
    } else {
      // Custom domain toggle
      const index = state.customDomains.indexOf(currentHostname);
      if (index >= 0) {
        state.customDomains.splice(index, 1);
      } else {
        state.customDomains.push(currentHostname);
      }
    }

    saveState();
    renderPlatforms(platformSearchInput.value);
  });

  // Init
  loadState();
});
