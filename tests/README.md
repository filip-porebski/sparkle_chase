Python UI tests for SparkleChase (renderer layer)

Overview
- These tests exercise the renderer (UI) using Playwright for Python.
- The Electron main process is not used; instead, we start a tiny HTTP server
  to serve the built renderer and inject a mock `window.electronAPI` so the UI behaves.

What this covers
- Core flows: creating a hunt, increment/decrement, phase logging (off‑target).
- Inline Filter and Quick Switch (Cmd/Ctrl+K) palette, fuzzy search.
- Lock/Unlock visibility and behavior, archived styling checks.
- Settings: number/date/time formatting, quick switch hotkey capture (basic), theme.
- Overlay trigger call (mocked), no crashes.

Prerequisites
- Python 3.9+
- Node 18+

Install and build
```bash
npm install
npm run build

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r tests/requirements.txt
python -m playwright install
```

Run tests
```bash
pytest -q
```

Notes
- Tests mock the Electron IPC (`window.electronAPI`) to avoid launching the main process.
- If you change the renderer selectors or add flows, update tests accordingly.
- These tests do not exercise real file I/O for OBS, nor global hotkey registration.

