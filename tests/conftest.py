import contextlib
import http.server
import os
import socket
import threading
from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page, sync_playwright


def _find_free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def dist_root() -> Path:
    root = Path(__file__).resolve().parents[1]
    dist = root / "dist" / "renderer"
    if not dist.exists():
        raise RuntimeError("Build the app first: npm run build")
    return dist


@pytest.fixture(scope="session")
def http_server(dist_root: Path):
    port = _find_free_port()

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(dist_root), **kwargs)

        def log_message(self, format, *args):  # noqa: N802
            pass

    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}/index.html"
    httpd.shutdown()
    thread.join()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()


@pytest.fixture()
def page(browser: Browser, http_server: str) -> Page:
    page = browser.new_page()
    # Inject a robust mock for window.electronAPI
    page.add_init_script(
        """
        (() => {
          const store = {
            settings: {
              theme: 'dark',
              dateFormat: 'YYYY-MM-DD',
              timeFormat: '24h',
              numberSeparator: 'comma',
              overlay: { variant: 'badge', clickThrough: true, alwaysOnTop: true, enabled: false },
              hotkeys: { increment:'Space', decrement:'CommandOrControl+Z', phase:'CommandOrControl+P', toggleGlobal:'CommandOrControl+Shift+G', quickSwitch:'CommandOrControl+K' },
              obsTextFolder: '', safeModeApps: [], globalHotkeysEnabled: false
            },
            hunts: []
          };

          function uuid() { return 'hunt_' + Math.random().toString(36).slice(2); }

          window.electronAPI = {
            // Hunts
            listHunts: async () => store.hunts,
            createHunt: async (data) => {
              const h = { id: uuid(), count:0, phases:[], modifiers:{ shinyCharm:false, masuda:false, chainTier:0 }, notes:'', encountersSinceLastShiny:0, stats:{ sessions:[], paceEph:0 }, archived:false, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data };
              store.hunts = [h, ...store.hunts];
              return h;
            },
            updateHunt: async (id, updates) => {
              store.hunts = store.hunts.map(h => h.id===id? { ...h, ...updates, updatedAt:new Date().toISOString() } : h);
              return store.hunts.find(h => h.id===id);
            },
            deleteHunt: async (id) => { const n=store.hunts.length; store.hunts = store.hunts.filter(h=>h.id!==id); return store.hunts.length<n; },

            // Counter operations
            incrementCounter: async (id) => { const h=store.hunts.find(h=>h.id===id); if(!h||h.archived) return null; h.count++; h.encountersSinceLastShiny++; h.updatedAt = new Date().toISOString(); return h; },
            decrementCounter: async (id) => { const h=store.hunts.find(h=>h.id===id); if(!h||h.archived) return null; h.count=Math.max(0,h.count-1); h.encountersSinceLastShiny=Math.max(0,h.encountersSinceLastShiny-1); h.updatedAt = new Date().toISOString(); return h; },
            setCounter: async (id, count) => { const h=store.hunts.find(h=>h.id===id); if(!h||h.archived) return null; h.count=Math.max(0,count); h.updatedAt=new Date().toISOString(); return h; },

            // Phases
            addPhase: async (id, phase) => { const h=store.hunts.find(h=>h.id===id); if(!h||h.archived) return null; const p={ id:'phase_'+Math.random().toString(36).slice(2), atCount:h.count, species: phase.species, isTarget: !!phase.isTarget, notes: phase.notes||'', createdAt:new Date().toISOString() }; h.phases.push(p); h.encountersSinceLastShiny=0; h.updatedAt=new Date().toISOString(); return h; },
            deletePhase: async (id, phaseId) => { const h=store.hunts.find(h=>h.id===id); if(!h) return null; h.phases = h.phases.filter(p=>p.id!==phaseId); h.updatedAt=new Date().toISOString(); return h; },

            // Settings
            getSettings: async () => store.settings,
            updateSettings: async (updates) => { store.settings = { ...store.settings, ...updates }; return store.settings; },

            // Overlay (mock)
            toggleOverlay: async () => true,
            showOverlay: async () => {},
            hideOverlay: async () => {},
            isOverlayVisible: async () => false,
            updateOverlayNow: async () => {},

            // Hotkey events (mock no-op)
            onHotkeyIncrement: (cb) => () => {},
            onHotkeyDecrement: (cb) => () => {},
            onHotkeyPhase: (cb) => () => {},
            onGlobalHotkeyToggled: (cb) => () => {},

            setTypingActive: () => {}
          };
        })();
        """
    )
    page.goto(http_server)
    return page

