# Shiny Counter — Agent Spec (Electron, macOS & Windows)

> Single‑player shiny hunting counter for Nintendo Pokémon games. Cross‑platform Electron app with local file storage today and cloud‑folder sync later (iCloud/OneDrive/Dropbox).

---

## 🔥 Priority Stack (top = build first)

### P0 — MVP (ship this first)
1. **Big +1 counter**  
   - Large on-screen button; **Space** increments; clickable and keyboard.  
   - Optional **−1** (Undo) and **manual edit** field.  
   - **Auto‑save every increment**; crash‑safe restore.
2. **Global hotkey (toggle)**  
   - Register/unregister a system‑wide increment hotkey (default Space when app focused, global when enabled).  
   - Safe‑mode to avoid conflicts (temporarily suspend when disallowed apps are focused).
3. **Hunt management (basic)**  
   - Create/select **one active hunt**; rename; delete (with confirm).  
   - Per‑hunt fields: Target species name, Game, Method, Base odds.  
   - **Notes** field.
4. **Phasing**  
   - One‑click **“Phase”** button to log an off‑target shiny.  
   - Log: timestamp, encounter number, species (free text), target?: yes/no.  
   - Show **Encounters since last shiny**.
5. **Basic stats & odds**  
   - Encounters/hour (per session).  
   - Chance of **no shiny after N** and “You’re **X% past odds**.”  
   - Simple ETA from pace × odds.
6. **Streamer I/O (text files)**  
   - Write `count.txt`, `target.txt`, `phase.txt` to a user‑chosen folder for OBS.  
   - Optional toast + confetti/SFX when marking shiny.
7. **Overlay window (tiny)**  
   - Always‑on‑top, **click‑through**, draggable; shows target, count, phase, odds.  
   - Simple theme: light/dark; large type.
8. **Local file storage (now)**  
   - Plain JSON files inside an app data folder (see **Storage Plan**).  
   - Import/Export hunts as JSON; versioned autosave snapshots.

### P1 — Near‑term (next releases)
1. **Multiple hunts & quick switcher**, pin “current hunt”.
2. **Templates & tags** (species/method presets; filter/search).  
3. **Rebindable hotkeys**; **hold‑to‑repeat**; scroll‑wheel +1 / Shift+wheel −1.  
4. **Session tracking** start/stop; daily/weekly summaries.  
5. **Visuals**: target sprite/GIF (cached), shiny preview toggle.  
6. **Compact overlay variants** (badge/ticker) + JSON endpoint for browser source.  
7. **Versioned backups** + “Recover previous session.”  
8. **Accessibility**: high contrast, large type, color‑blind‑safe palette.
9. **Quick adjusters**: +2 eggs, +5 chain, etc.

### P2 — Nice to have / quality of life
1. **Double/paired hunts** (+2 button or split counters).  
2. **Method‑aware odds presets** (Charm, Masuda, chain tiers, outbreaks, Radar, SOS, DA).  
3. **Charts**: cumulative count, encounters/hour trend, phase markers.  
4. **Break nudges** (every X mins or Y encounters) with snooze.  
5. **Boss key** (hide overlays, mute sounds).  
6. **Focus goal banner** (e.g., 500 encounters today).  
7. **Multi‑profile** (same machine, different users).  
8. **Gamepad support** (Web Gamepad API); optional vibration on phase.  
9. **Haptics** on macOS trackpads; beep on Windows.

### P3 — Future / power features
1. **Cloud‑folder sync (later)**: pick iCloud Drive/OneDrive/Dropbox folder; mirror the local data tree.  
2. **Local mini web server** for overlays; OBS WebSocket marker on shiny.  
3. **Discord webhook** (“Shiny found!” with card image).  
4. **Phase tree** (branching history), **phase impact charts**, time‑of‑day heatmap.  
5. **Monte Carlo simulator**: chance to see a shiny in next hour at current pace.  
6. **Living Dex tracker**, targets queue, ball/nature/mark logging.  
7. **“Random pick my next hunt”** with filters.  
8. **Voice hotkeys** (“increment”, “phase”).  
9. **Plugin hooks**: `onIncrement`, `onPhase`, `onHuntChange`.  
10. **Self‑update channel** (stable/beta) with data migrations.
11. **Capture‑card watcher** (pixel/audio cue) to flag likely shiny moments (manual confirm).

---

## UX Flows (P0)

### Start a new hunt
- New Hunt → enter Target species, Game, Method, Base odds → Save → becomes Active.  
- Overlay and text files update instantly.

### Increment
- Press Space or click **+1** → counter updates → JSON autosave → text files update.  
- Undo single step (Ctrl/Cmd+Z) or edit numeric field (with confirm).

### Phase (off‑target shiny)
- Press **Phase** → modal: species (optional), target? (checkbox), notes → logs the event at current count.  
- “Encounters since last shiny” resets to 0.

### Shiny/Success
- Mark **“Shiny found (target)”** → confetti/SFX → lock the hunt or continue tracking (user choice).  
- Snapshot written to `/snapshots/` and a shareable “shiny card” (P1/P2) when implemented.

---

## Technical Plan

### Stack
- **Electron + React + TypeScript** (Vite), Tailwind for styling.  
- IPC: `contextBridge` + preload for safe fs/hotkey access.  
- Charts: Recharts (when added). Sounds via HTMLAudioElement.

### Key Electron APIs
- `globalShortcut` for hotkeys (enable/disable toggle).  
- Always‑on‑top overlay: frameless BrowserWindow, `setIgnoreMouseEvents(true, { forward: true })`.  
- `app.getPath('userData')` for default data directory.  
- `dialog.showOpenDialog` for choosing OBS text output folder / export/import.  
- **No elevated permissions**; all local.

### File Storage Plan

**Now (local files):**
```
/{userData}/shiny-counter/
  config/
    settings.json                  // app-level settings, paths, theme, hotkeys
  hunts/
    {huntId}.json                  // one file per hunt (see schemas)
  sessions/
    {sessionId}.json               // optional P1
  phases/
    {phaseId}.json                 // or embedded within hunts (P0 embeds)
  snapshots/
    {ISO-YYYYMMDD-HHMMSS}-{huntId}.json
  overlays/                        // user-chosen folder (can be outside userData)
    count.txt
    target.txt
    phase.txt
```
- **Autosave** on each increment to the active hunt file plus a throttled snapshot (every ~30s and on significant events).  
- **Import/Export**: single `.shiny.json` bundle with embedded hunts + phases.

**Later (cloud‑folder sync):**
- “Choose sync folder” → app mirrors the same tree into that folder.  
- **Conflict resolution**: newest `updatedAt` wins; keep conflicted copies with suffix `.{deviceName}.json`.  
- Optional **watcher** to detect external edits (debounced).  
- No vendor SDKs; rely on user’s OS sync client.

### Data Model (JSON, versioned)

All records include: `id`, `createdAt`, `updatedAt`, `appVersion`.

**Hunt**
```json
{
  "id": "hunt_xxx",
  "name": "Ralts",
  "game": "SV",
  "method": "Encounters",
  "targetSpecies": "Ralts",
  "baseOdds": {"numerator": 1, "denominator": 4096},
  "modifiers": {"shinyCharm": true, "masuda": false, "chainTier": 0},
  "count": 3217,
  "phases": [
    {
      "id": "phase_001",
      "atCount": 1840,
      "species": "Hoppip",
      "isTarget": false,
      "notes": "Outbreak on South Province",
      "createdAt": "2025-08-20T18:10:23Z"
    }
  ],
  "notes": "Sunny sandwich, area one.",
  "encountersSinceLastShiny": 1377,
  "stats": { "sessions": [], "paceEph": 0 },
  "archived": false,
  "createdAt": "2025-08-18T12:00:00Z",
  "updatedAt": "2025-08-25T15:00:00Z"
}
```

**Settings**
```json
{
  "theme": "dark",
  "overlay": {"variant": "badge", "clickThrough": true, "alwaysOnTop": true},
  "hotkeys": {"increment": "Space", "decrement": "Backspace", "phase": "Ctrl+P", "toggleGlobal": "Ctrl+Shift+G", "quickSwitch": "Ctrl+K", "zenMode": "Ctrl+J"},
  "obsTextFolder": "C:/…/Overlays/ShinyCounter/",
  "safeModeApps": ["Photoshop.exe", "Premiere.exe"]
}
```

**Session** (P1)
```json
{
  "id": "session_xxx",
  "huntId": "hunt_xxx",
  "startAt": "2025-08-25T13:00:00Z",
  "endAt": "2025-08-25T14:20:00Z",
  "encounters": 800,
  "encountersPerHour": 600
}
```

### Odds Engine (P0 math)
- Effective shiny probability per encounter `p` determined by `baseOdds` and modifiers (start simple, manual overrides).  
- **No shiny after N**: `(1 - p)^N`.  
- “Past odds multiple”: `N / (1/p)`.  
- ETA to hit 1× odds at current pace: `(1/p) / (encounters/hour)`.

### Hotkey Map (defaults, rebindable in P1)
- **Space**: +1 (when app focused; optional global toggle).  
- **Ctrl/Cmd+Z**: −1 (undo last).  
- **Ctrl/Cmd+P**: Phase dialog.  
- **Ctrl/Cmd+Shift+G**: Toggle global hotkey.  
- (P1) Scroll‑wheel +1; Shift+wheel −1; long‑press repeat; gamepad A = +1.

### Overlay & Stream Labels (P0)
- **Text files** updated on each change:  
  - `count.txt` → current count  
  - `target.txt` → target species or “—”  
  - `phase.txt` → “Phase #N — species at count” or “No phases yet”  
- **Overlay window** (frameless): target, count, phase badge, odds line.  
- **Confetti/SFX** on “Shiny found / Phase.”

### Accessibility (P0→P1)
- Large type toggle; dark/light; high‑contrast palette.  
- Color‑blind‑friendly highlights; avoid relying on red/green alone.  
- Keyboard‑only navigation; visible focus states.

### Privacy & Security
- All data **local by default**; no analytics, no network access in P0.  
- When cloud‑folder sync is enabled, files are stored in the user’s chosen sync folder only.  
- Export contains only the selected hunts and settings.

---

## Roadmap (suggested)

**Milestone 1 — MVP (P0)**  
- Core counter, global hotkey toggle, basic hunt + phase, basic odds, text file I/O, overlay, local JSON storage, import/export, autosave.

**Milestone 2 — Quality Pass (P1)**  
- Multi‑hunt, templates/tags, rebindable inputs & scroll‑wheel, sessions & summaries, sprites cache, compact overlays, backups & recovery, accessibility polish.

**Milestone 3 — Power‑ups (P2)**  
- Paired hunts, method‑aware presets, charts, break nudges, boss key, goals, multi‑profile, gamepad & haptics.

**Milestone 4 — Integrations & Sync (P3)**  
- Cloud‑folder sync, local web server + JSON endpoint, OBS WebSocket markers, Discord webhook, advanced analytics (phase tree, heatmaps), Living Dex, plugins, voice hotkeys, capture‑card watcher.

---

## Acceptance Criteria (P0 highlights)

- **Counter reliability**: 10,000 rapid increments produce 10,000 persisted count with zero loss.  
- **Crash safety**: Kill the app mid‑spam; on relaunch, count reflects the last click (at most 1 increment lost).  
- **Global hotkey**: Works across OS; can be toggled; never fires when suspended in safe‑mode apps.  
- **Phase logging**: Creates a record with encounter number & timestamp; “since last shiny” updates.  
- **Odds**: Displays correct `no-shiny` probability and past‑odds multiple given configured odds.  
- **Overlay**: Always on top, click‑through, updates <100ms after increment.  
- **Text files**: Update on every change; path configurable; handles missing folder gracefully.  
- **Local storage**: Human‑readable JSON files; import/export round‑trips without data loss.

---

## Open Decisions (pick defaults now, revisit later)
- Use **embedded phases** inside the hunt file (P0) vs separate `phases/` (later if files grow).  
- JSON only (simplest) vs **SQLite (better-sqlite3)** later for aggregation speed.  
- Default data dir: `{userData}/shiny-counter/` with optional “Choose data folder…” setting.  
- Default global hotkey behavior (off by default; toggle in UI).

---

## Dev Notes
- Keep **domain logic** pure and testable (no Electron APIs).  
- Add **migration layer** keyed by `appVersion` in every record.  
- Externalize strings for future localization (EN first).  
- Unit tests for math (odds), reducers, and persistence.  
- Use Preload + IPC; never expose `fs` directly to the renderer.
### Zen Mode
- Toggle via the corner icon on the main counter card or hotkey (default Ctrl/Cmd+J).  
- Expands the main card and hides the sidebar and auxiliary cards until toggled off.
