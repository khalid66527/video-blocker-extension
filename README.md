# 🛡️ Universal Video Blocker (Chrome Extension)

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chrome Extension](https://img.shields.io/badge/Platform-Google%20Chrome-blue.svg)](https://chrome.google.com/webstore)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript%20ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

A powerful, customizable, and high-performance **Chrome Extension (Manifest V3)** that allows you to selectively block video playback, auto-playing video feeds, and media streams across specific social platforms or custom websites.

Unlike primitive video blockers that block media indiscriminately everywhere, **Universal Video Blocker** puts **you** in full control: turn video blocking ON or OFF for individual platforms like **YouTube, Facebook, Instagram, TikTok, Twitter/X, Twitch**, or any custom domain with a single click.

---

## 🌟 Key Features

- 🎛️ **Master On/Off Switch**: Pause or resume the entire extension instantly with a single toggle.
- 🎯 **Per-Platform Selection**: Choose exactly which video platforms to block without affecting other sites:
  - 🔴 **YouTube** (`youtube.com`, `youtu.be`, `googlevideo.com`)
  - 🔵 **Facebook** (`facebook.com`, `fb.watch`, `fbcdn.net`)
  - 🟣 **Instagram** (`instagram.com`, `cdninstagram.com`)
  - 🎵 **TikTok** (`tiktok.com`, `tiktokcdn.com`)
  - 🐦 **Twitter / X** (`twitter.com`, `x.com`, `twimg.com`)
  - 🟣 **Twitch** (`twitch.tv`, `ttvnw.net`)
  - 🔴 **Reddit** (`reddit.com`, `v.redd.it`)
  - 🔵 **Vimeo** (`vimeo.com`, `vimeocdn.com`)
  - 🎥 **Dailymotion** (`dailymotion.com`, `dmcdn.net`)
- ⚡ **One-Click Active Site Toggle**: Automatically detects your current active tab's domain and lets you block or allow videos on that site with one click (`🛡️ Blocked` / `▶ Allowed`).
- 🌐 **Custom Domain Manager**: Add any custom website domain (e.g. `news.yahoo.com` or `custom-site.com`) to enforce video blocking on specific sites.
- 🔍 **Live Search Filter**: Quickly filter through supported platforms inside the popup UI.
- ⚡ **Triple-Layer Zero-Flicker Protection**:
  1. **Network Layer**: Uses Chrome `declarativeNetRequest` (DNR) dynamic rules to block video stream requests (`.mp4`, `.m3u8`, `.mpd`, MSE streams) at the network core level.
  2. **JavaScript Main World API Override**: Intercepts `MediaSource`, `HTMLMediaElement.prototype.play`, `load()`, and `URL.createObjectURL` to halt video execution programmatically.
  3. **CSS & DOM Purger**: Injects instant zero-FOUC CSS styles and runs `MutationObserver` to destroy `<video>` tags, Reels, Shorts, and Shadow DOM video players.
- 🎨 **Modern Glassmorphic UI**: Sleek dark theme interface with glowing indicators, crisp icons, smooth iOS-style switches, and responsive chip tags.

---

## 📥 Installation & Setup Guide (PC / Google Chrome)

Follow these easy steps to install the extension on your computer:

### Step 1: Clone or Download the Repository
Clone this repository or download it as a ZIP file and extract it to a folder on your PC:
```bash
git clone https://github.com/your-username/video-blocker-extension.git
```

### Step 2: Open Chrome Extensions Page
1. Open **Google Chrome** on your PC.
2. In the address bar, type:
   ```text
   chrome://extensions/
   ```
   and press **Enter**.

### Step 3: Enable Developer Mode
In the top-right corner of the Extensions page, toggle the **Developer mode** switch to **ON** (blue).

### Step 4: Load Unpacked Extension
1. Click the **Load unpacked** button in the top-left corner.
2. Browse to the folder where you cloned/extracted this project:
   `c:\Programing Hero\All_Project\video-blocker-extension`
3. Click **Select Folder**.

🎉 **Done!** The extension icon 🛡️ will now appear in your Chrome toolbar. Pin it for quick access!

---

## 📖 How to Use

1. **Click the Extension Icon** 🛡️ in your Chrome toolbar to open the popup.
2. **Global Control**: Use the **Master Switch** at the top to toggle all video blocking ON or OFF.
3. **Current Site Quick Action**: Look at the **Current Website** card. Click **Block Site** or **Allow Site** to customize blocking for the open tab immediately.
4. **Configure Platforms**: Toggle individual switches for YouTube, Facebook, Instagram, TikTok, Twitter/X, etc.
5. **Add Custom Websites**: Type any domain (e.g. `cnn.com`) in the **Custom Blocked Websites** box and click **Add**.
6. **Enjoy Distraction-Free Browsing**: Videos on your blocked list will be blocked without breaking non-video content or unblocked sites!

---

## 🏗️ Project Structure

```text
video-blocker-extension/
├── manifest.json       # Chrome Manifest V3 configuration & permissions
├── background.js       # Background service worker & declarativeNetRequest sync
├── content.js          # Main world JS injection, CSS hiding & DOM MutationObserver
├── popup.html          # Extension popup UI structure
├── popup.css           # Glassmorphism dark aesthetic styling
├── popup.js            # Popup state management, tab detection & storage handler
├── rules.json          # declarativeNetRequest rule template reference
├── icons/              # Extension icon assets
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # Project documentation
```

---

## 🛠️ Tech Stack & Architecture

- **Manifest V3**: Compliant with Google Chrome's modern extension standards.
- **declarativeNetRequest API**: High-performance browser-native request blocking without slowing down page execution.
- **Chrome Storage API (`chrome.storage.local`)**: Synchronizes user preferences across background service worker, popup, and content scripts in real time.
- **Main World JS Injection**: Intercepts HTML5 video prototypes before web pages run their scripts.
- **Vanilla JavaScript & CSS**: Zero external framework dependencies for maximum performance and fast load times.

---

## 🛡️ Permissions Explained

| Permission | Purpose |
| :--- | :--- |
| `declarativeNetRequest` | Dynamically blocks media network requests (`.mp4`, `.m3u8`, media streams). |
| `storage` | Saves user platform toggles and custom site lists locally. |
| `activeTab` / `tabs` | Detects the domain of the current open tab for 1-click quick toggling. |
| `<all_urls>` | Enables selective blocking on requested websites. |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
