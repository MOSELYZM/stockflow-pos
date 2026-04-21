# StockFlow POS - Desktop App (Electron)

## Quick Start - Desktop App

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v18+)

### Install & Run Desktop App

```bash
# Install dependencies
npm install

# Run desktop app in development mode
npm run desktop:dev

# Build desktop app for production
npm run desktop:build
```

## Project Structure

```
├── src/                    # React web app source
├── electron/              # Electron configuration
│   ├── main.js            # Electron entry point
│   └── preload.js         # Preload script
├── dist/                  # Built web app (auto-generated)
└── package.json           # npm scripts & dependencies
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run web version with backend |
| `npm run desktop:dev` | Run desktop app (development) |
| `npm run desktop:build` | Build desktop installer |
| `npm run desktop:pack` | Build without packaging |
| `npm run build` | Build web version |

## Build Outputs

After `npm run desktop:build`, find installers in:
- **Windows**: `release/` (.exe installer)
- **macOS**: `release/` (.dmg)
- **Linux**: `release/` (.AppImage or .deb)

## Features

- ✅ Works completely offline
- ✅ Native desktop window
- ✅ Print support for receipts
- ✅ Local data storage
- ✅ Cross-platform (Windows, macOS, Linux)

## License

© 2024 Hakanene Mosely
