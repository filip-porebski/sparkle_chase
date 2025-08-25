# Shiny Counter

A cross-platform Electron app for tracking shiny Pokémon encounters during hunts.

## Features

### P0 (MVP) - Currently Implemented
- ✅ **Big +1 counter** with Space key increment and clickable interface
- ✅ **Global hotkey toggle** for system-wide increment hotkey
- ✅ **Hunt management** - Create, select, rename, and delete hunts
- ✅ **Phasing** - Log off-target shinies with species and notes
- ✅ **Basic stats & odds** - Encounter tracking and probability calculations
- ✅ **Streamer I/O** - Text file output for OBS (count.txt, target.txt, phase.txt)
- ✅ **Overlay window** - Always-on-top, click-through display
- ✅ **Local file storage** - JSON-based data persistence with autosave

### Planned Features
- **P1**: Multiple hunts, templates, rebindable hotkeys, session tracking
- **P2**: Charts, break nudges, gamepad support, accessibility improvements
- **P3**: Cloud sync, Discord webhooks, advanced analytics

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package for distribution
npm run build:electron
```

### Project Structure
```
src/
├── main/           # Electron main process
│   ├── data/       # Data management
│   ├── hotkeys/    # Global hotkey handling
│   └── overlay/    # Overlay window management
├── preload/        # Electron preload scripts
├── renderer/       # React frontend
│   └── components/ # UI components
└── shared/         # Shared types and utilities
```

### Tech Stack
- **Electron** - Cross-platform desktop app framework
- **React + TypeScript** - Frontend UI
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **JSON** - Local data storage

## Usage

### Creating a Hunt
1. Click "New Hunt" in the Hunt Manager
2. Fill in target species, game, method, and base odds
3. Click "Create Hunt" to start tracking

### Incrementing Counter
- Click the "+1" button
- Press Space key (when app is focused)
- Enable global hotkeys for system-wide Space key support

### Logging Phases
- Click "Phase (Off-target Shiny)" button
- Press Ctrl/Cmd+P hotkey
- Enter the species found and any notes

### Settings
- Configure global hotkeys
- Set OBS text file output folder
- Customize overlay appearance
- Set theme (light/dark)

## Data Storage

Hunt data is stored locally in JSON files:
- **Windows**: `%APPDATA%/shiny-counter/`
- **macOS**: `~/Library/Application Support/shiny-counter/`
- **Linux**: `~/.config/shiny-counter/`

### File Structure
```
shiny-counter/
├── config/
│   └── settings.json
├── hunts/
│   └── {huntId}.json
└── snapshots/
    └── {timestamp}-{huntId}.json
```

## Hotkeys

| Action | Default Binding | Description |
|--------|----------------|-------------|
| Increment | Space | Add +1 to counter |
| Decrement | Ctrl/Cmd+Z | Subtract -1 from counter |
| Phase | Ctrl/Cmd+P | Open phase dialog |
| Toggle Global | Ctrl/Cmd+Shift+G | Enable/disable global hotkeys |

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and feature requests, please use the GitHub issue tracker.