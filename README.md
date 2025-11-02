# Tab Nudge - Chrome Extension

A smart Chrome extension that helps you manage browser tab overload with intelligent notifications and cleanup actions. Built with React, TypeScript, and shadcn/ui components.

## 🚀 Features

- **Smart Tab Monitoring**: Automatically detects when you exceed your tab threshold
- **Instant Notifications**: Chrome notifications with quick action buttons
- **Action Engine**: Four powerful tab management actions:
  - 🧹 Close Oldest Tabs
  - 📑 Close Duplicate Tabs
  - 📁 Group Tabs by Domain
  - 😴 Snooze Notifications
- **Undo System**: 10-second window to restore accidentally closed tabs
- **Beautiful UI**: Built with shadcn/ui for consistent, accessible design
- **Customizable Settings**: Adjust thresholds, cooldowns, and preferences

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Chrome browser (for testing)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd chrome-extension
npm install
```

2. **Build the extension**:
```bash
npm run build
```

3. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Development Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with hot reload
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Package for distribution
npm run package
```

## 📁 Project Structure

```
chrome-extension/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── background/            # Service worker
│   │   ├── index.ts          # Main background script
│   │   ├── tab-monitor.ts    # Tab threshold monitoring
│   │   ├── action-engine.ts  # Tab cleanup actions
│   │   └── notification-manager.ts # Chrome notifications
│   ├── popup/                # Extension popup
│   ├── sidepanel/            # Side panel interface
│   ├── options/              # Settings page
│   ├── components/ui/        # shadcn/ui components
│   ├── lib/                  # Utilities and storage
│   └── types/                # TypeScript type definitions
├── scripts/                  # Build and utility scripts
└── dist/                     # Built extension (created by build)
```

## ⚙️ Configuration

### Default Settings

- **Tab Threshold**: 30 tabs
- **Cooldown Period**: 10 minutes  
- **Quick Close Count**: 10 tabs
- **Default Snooze**: 1 hour

### Keyboard Shortcuts

- `Ctrl+Shift+T` - Open actions panel
- `Ctrl+Shift+O` - Close oldest tabs
- `Ctrl+Shift+D` - Close duplicate tabs
- `Ctrl+Shift+S` - Snooze notifications

> **Note**: Shortcuts can be customized in Chrome's extension settings.

## 🧪 Testing

### Manual Testing

1. **Build and load** the extension in Chrome
2. **Open multiple tabs** (>30) to trigger threshold alert
3. **Test notification actions**: Quick Clean and Snooze buttons
4. **Test side panel**: All four action types with previews
5. **Test undo system**: Execute action, then undo within 10 seconds
6. **Test settings**: Modify thresholds and verify changes take effect

### Automated Testing

```bash
# Run unit tests
npm test

# Run e2e tests (requires built extension)
npm run test:e2e
```

## 📋 Chrome Extension Permissions

This extension requests these permissions:

- `tabs` - Monitor and manage browser tabs
- `storage` - Save user preferences and runtime state
- `notifications` - Display threshold alerts
- `alarms` - Schedule snooze functionality
- `sessions` - Restore tabs for undo functionality

## 🔧 Technical Architecture

### Manifest V3 Compliance
- Service Worker background script (no persistent background page)
- Declarative permissions model
- Content Security Policy compliant

### Key Components
- **TabMonitor**: Debounced tab counting with threshold detection
- **ActionEngine**: Handles all tab manipulation actions
- **NotificationManager**: Chrome notification system integration
- **StorageManager**: Handles settings and runtime state persistence

### State Management
- Settings: `chrome.storage.local` with reactive updates
- Runtime State: In-memory with periodic persistence
- Undo Stack: Time-based expiration (10 seconds)

## 🚢 Distribution

### Building for Production

1. **Run production build**:
```bash
npm run build
```

2. **Package extension**:
```bash
npm run package
```

3. **Upload to Chrome Web Store**:
   - The `dist` folder contains the built extension
   - Zip the contents of `dist` (not the folder itself)
   - Upload via [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)

### Release Checklist

- [ ] Update version in `package.json` and `manifest.json`
- [ ] Test all functionality in clean Chrome profile
- [ ] Verify no console errors
- [ ] Check permissions are minimal
- [ ] Update changelog
- [ ] Create release build
- [ ] Test installed extension from zip

## 🎨 Design System

Uses shadcn/ui components for consistent, accessible design:

- **Colors**: CSS custom properties for theming
- **Typography**: System font stack with proper scales
- **Spacing**: Consistent spacing system
- **Components**: Accessible, keyboard-navigable components

## 📞 Support

For issues and feature requests, please:

1. Check existing issues in the repository
2. Provide detailed reproduction steps
3. Include Chrome version and OS details
4. Attach relevant console logs if available

## 📄 License

[Your chosen license]

---

**Made with ❤️ using React, TypeScript, and shadcn/ui**
