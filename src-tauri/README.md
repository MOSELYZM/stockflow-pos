# StockFlow POS - Desktop App

This is the desktop version of StockFlow POS, built with Tauri for Windows, macOS, and Linux.

## Features

- **Offline-first**: All data stored locally, works without internet
- **Fast & Lightweight**: Native performance, small bundle size
- **Cross-platform**: Windows, macOS, and Linux support
- **Auto-updates**: Built-in updater support
- **Native APIs**: File system access, native dialogs, system notifications

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (for Tauri)
- Windows: Microsoft Visual Studio C++ Build Tools

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run desktop:dev
```

### Building

Build for production:
```bash
npm run desktop:build
```

The built app will be in `src-tauri/target/release/bundle/`.

### Platforms

- **Windows**: `.msi` and `.exe` installer
- **macOS**: `.dmg` and `.app` bundle
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

## Icons

Icons are located in `src-tauri/icons/`. To regenerate icons from the source logo:

```bash
cd src-tauri
# Install tauri-icon (one time)
cargo install tauri-icon
# Generate icons
tauri-icon generate icons/icon.png
```

## Configuration

### Window Settings
- Default size: 1400x900
- Minimum size: 1200x700
- Resizable: Yes
- Decorations: Yes (native window frame)

### Security
- CSP: Configured for local development
- File system access: Limited to APPDATA and DOWNLOADS folders
- Shell access: Enabled for opening external links

## Scripts

- `npm run desktop:dev` - Run desktop app in development
- `npm run desktop:build` - Build desktop app for production
- `npm run tauri` - Run Tauri CLI commands
- `npm run dev` - Run web version only

## Troubleshooting

### Windows
- If build fails, ensure Visual Studio Build Tools are installed
- Run PowerShell as Administrator for signing (optional)

### macOS
- May need to allow app in Security & Privacy settings
- For distribution, Apple Developer certificate required

### Linux
- Install dependencies: `sudo apt install libwebkit2gtk-4.0-dev`
- For AppImage, fuse may be required

## License

© 2024 Hakanene Mosely
