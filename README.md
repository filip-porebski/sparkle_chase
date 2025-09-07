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
- ✅ **Rebindable hotkeys with modifiers** — capture Ctrl/Cmd/Alt/Shift combos in Settings (press Escape to cancel)
- ✅ **Quick Switcher** — quickly switch hunts (default: Ctrl/Cmd+K)
- ✅ **Zen Mode** — maximize the main card and hide the sidebar; toggle via corner icon or hotkey

### Planned Features
- **P1**: Multiple hunts, templates, session tracking
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

### Zen Mode
- Click the expand/collapse icon at the top-right of the main card to enter/exit Zen Mode.
- Default hotkey: Ctrl/Cmd+J (configurable in Settings → Hotkey Bindings).
- In Zen Mode the main counter card fills the app; the sidebar and extra cards are hidden.

### Settings
- Configure global hotkeys
- Rebind hotkeys; modifiers (Ctrl/Cmd/Alt/Shift) are supported during capture
- Set OBS text file output folder
- Customize overlay appearance
- Set theme (light/dark)
- Choose storage mode (Portable vs. User Data)
- Optional Quick Switcher hotkey (default Ctrl/Cmd+K)

## Data Storage

SparkleChase supports two storage modes:

- Portable (default): `{application-directory}/out/` — keeps configuration and output files next to the app, making it portable and self‑contained.
- User Data (OS standard): stores files under the OS app data directory (e.g. `%APPDATA%/SparkleChase`, `~/Library/Application Support/SparkleChase`).

You can switch modes in Settings → Storage Mode. On change, data migrates automatically.

### File Structure
```
out/
├── config/
│   └── settings.json
├── hunts/
│   └── {huntId}.json
└── snapshots/
    └── {timestamp}-{huntId}.json
```

In User Data mode the same structure is used under the OS app data folder.

## Hotkeys

| Action | Default Binding | Description |
|--------|----------------|-------------|
| Increment | Space | Add +1 to counter |
| Decrement | Backspace | Subtract -1 from counter |
| Phase | Ctrl/Cmd+P | Open phase dialog |
| Toggle Global | Ctrl/Cmd+Shift+G | Enable/disable global hotkeys |
| Quick Switch | Ctrl/Cmd+K | Open hunt switcher (app‑focused) |
| Zen Mode | Ctrl/Cmd+J | Toggle Zen mode (local and global when enabled) |

Notes:
- Hotkeys are configurable in Settings → Hotkey Bindings. Modifier combos are supported. Press Escape to cancel during capture.
- Global hotkeys apply when “Global Hotkeys” is enabled (toggled in Settings). Local hotkeys always work when the app is focused.

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

## Releases & Updates

### Versioning
- Bump versions using npm’s version scripts (these create a tag):
  - `npm run version:patch`
  - `npm run version:minor`
  - `npm run version:major`

### Building and publishing releases
- Configure your repository details in `package.json` (`repository.url`, `homepage`).
- Option A (recommended, local helper script):
  1. Copy the example script and put your token inside:
     ```bash
     cp scripts/release_with_token.example.sh scripts/release_with_token.sh
     # edit scripts/release_with_token.sh and set GH_TOKEN_VALUE
     ```
  2. Run a release (bump version automatically and publish):
     ```bash
     bash scripts/release_with_token.sh patch   # or minor / major / none
     ```

- Option B (manual env var):
  1. Set `GH_TOKEN` in your environment (a GitHub token with `repo` scope).
  2. Run a multi‑platform release build and publish to GitHub Releases:

```bash
# Install dependencies
npm ci

# Build & publish for macOS, Windows, and Linux
# (Cross‑platform builds require proper host tools: e.g., Windows signing on Windows,
#  macOS notarization on macOS, Wine for building Windows targets on macOS/Linux.)
GH_TOKEN=your_token npm run release
```

electron‑builder will create artifacts and publish them to GitHub Releases in your repository.

### Auto‑update on startup
- The app uses `electron-updater` with the `github` provider (via `electron-builder` config) to check for updates on startup and notify the user when a new version is available.
- No external hosting is required; GitHub Releases is sufficient.
- Behavior:
  - On launch, the app calls `autoUpdater.checkForUpdatesAndNotify()`.
  - When an update is downloaded, the app prompts to restart and applies the update.
