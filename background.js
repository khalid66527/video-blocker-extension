/**
 * Universal Video Blocker - Background Service Worker
 * Manages storage initialization and dynamic declarativeNetRequest (DNR) network blocking rules.
 */

const DEFAULT_PLATFORMS = {
  youtube: {
    name: 'YouTube',
    domains: ['youtube.com', 'youtu.be', 'googlevideo.com']
  },
  facebook: {
    name: 'Facebook',
    domains: ['facebook.com', 'fb.watch', 'fbcdn.net']
  },
  instagram: {
    name: 'Instagram',
    domains: ['instagram.com', 'cdninstagram.com']
  },
  tiktok: {
    name: 'TikTok',
    domains: ['tiktok.com', 'tiktokcdn.com']
  },
  twitter: {
    name: 'Twitter / X',
    domains: ['twitter.com', 'x.com', 'twimg.com']
  },
  twitch: {
    name: 'Twitch',
    domains: ['twitch.tv', 'ttvnw.net']
  },
  reddit: {
    name: 'Reddit',
    domains: ['reddit.com', 'v.redd.it']
  },
  vimeo: {
    name: 'Vimeo',
    domains: ['vimeo.com', 'vimeocdn.com']
  },
  dailymotion: {
    name: 'Dailymotion',
    domains: ['dailymotion.com', 'dmcdn.net']
  }
};

const DEFAULT_SETTINGS = {
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

async function syncDynamicRules(settings) {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);

    if (!settings || settings.masterEnabled === false) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: []
      });
      return;
    }

    const blockedDomains = new Set();
    const platforms = settings.platforms || {};

    Object.keys(DEFAULT_PLATFORMS).forEach(pKey => {
      if (platforms[pKey] !== false) {
        DEFAULT_PLATFORMS[pKey].domains.forEach(d => blockedDomains.add(d));
      }
    });

    if (Array.isArray(settings.customDomains)) {
      settings.customDomains.forEach(d => {
        if (d && typeof d === 'string') {
          blockedDomains.add(d.trim().toLowerCase());
        }
      });
    }

    let nextId = 1;
    const newRules = [];

    blockedDomains.forEach(domain => {
      newRules.push({
        id: nextId++,
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: domain,
          isUrlFilterCaseSensitive: false,
          resourceTypes: ['media', 'xmlhttprequest', 'other', 'sub_frame', 'websocket']
        }
      });

      newRules.push({
        id: nextId++,
        priority: 1,
        action: { type: 'block' },
        condition: {
          initiatorDomains: [domain],
          resourceTypes: ['media']
        }
      });
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: newRules
    });
  } catch (err) {
    console.error('Error syncing dynamic DNR rules:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['masterEnabled', 'platforms', 'customDomains'], (result) => {
    const settings = {
      masterEnabled: result.masterEnabled !== undefined ? result.masterEnabled : DEFAULT_SETTINGS.masterEnabled,
      platforms: result.platforms || DEFAULT_SETTINGS.platforms,
      customDomains: result.customDomains || DEFAULT_SETTINGS.customDomains
    };

    chrome.storage.local.set(settings, () => {
      syncDynamicRules(settings);
    });
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    chrome.storage.local.get(['masterEnabled', 'platforms', 'customDomains'], (settings) => {
      syncDynamicRules(settings);
    });
  }
});
