import { app, BrowserWindow, globalShortcut, ipcMain, dialog, Menu, shell, nativeImage } from 'electron';
// auto-updater is loaded dynamically to avoid crashing when not installed in dev
import * as path from 'path';
import * as fs from 'fs';
import { DataManager } from './data/DataManager';
import { HotkeyManager } from './hotkeys/HotkeyManager';
import { OverlayManager } from './overlay/OverlayManager';
import { Settings } from '../shared/types';
import { acceleratorFromInput } from './utils/accelerators';

class ShinyCounterApp {
  private mainWindow: BrowserWindow | null = null;
  private splashWindow: BrowserWindow | null = null;
  private dataManager: DataManager;
  private hotkeyManager: HotkeyManager;
  private overlayManager: OverlayManager;
  private typingActive: boolean = false;
  private currentSettings: Settings | null = null;

  constructor() {
    this.dataManager = new DataManager();
    this.hotkeyManager = new HotkeyManager();
    this.overlayManager = new OverlayManager();
  }

  async initialize() {
    // Ensure the app name is SparkleChase in dev and prod (menus, dock hover on macOS)
    try { app.setName('SparkleChase'); } catch {}
    try {
      app.setAboutPanelOptions({ applicationName: 'SparkleChase' });
    } catch {}
    // Improve Windows identity (notifications, taskbar grouping)
    try { app.setAppUserModelId('com.sparklechase.app'); } catch {}
    await app.whenReady();
    
    // Initialize data manager
    await this.dataManager.initialize();
    
    // Harden app menu in production
    if (process.env.NODE_ENV !== 'development') {
      try { Menu.setApplicationMenu(null); } catch {}
    } else {
      // In development, create a minimal app menu labeled SparkleChase
      try {
        const template: Electron.MenuItemConstructorOptions[] = [
          {
            label: 'SparkleChase',
            submenu: [
              { label: 'About SparkleChase', click: () => { try { app.showAboutPanel(); } catch {} } },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit', label: 'Quit SparkleChase' }
            ]
          },
          {
            label: 'Edit',
            submenu: [
              { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
              { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
            ]
          },
          {
            label: 'View',
            submenu: [
              { role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' },
              { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' },
              { role: 'togglefullscreen' }
            ]
          }
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
      } catch {}
    }

    // Create splash first (skip in dev if desired)
    // Always show splash (dev + prod). In dev, it's a fixed short delay.
    this.createSplashWindow();
    this.createMainWindow(false);
    
    // Setup IPC handlers
    this.setupIpcHandlers();
    
    // Setup hotkeys
    this.setupHotkeys();

    // Check for updates (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      this.setupAutoUpdater();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  private setupAutoUpdater() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { autoUpdater } = require('electron-updater');
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.on('update-available', () => {
        this.mainWindow?.webContents.send('update:available');
      });
      autoUpdater.on('update-downloaded', async () => {
        const res = await dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          buttons: ['Restart Now', 'Later'],
          defaultId: 0,
          cancelId: 1,
          message: 'An update has been downloaded',
          detail: 'Restart the app to apply the update.'
        });
        if (res.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
      // Kick off update check
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    } catch (e) {
      // Swallow update errors to avoid disrupting startup
      console.error('AutoUpdater init failed', e);
    }
  }

  private getIconPath(): string | null {
    // Prefer packaged resources, then local resources, then renderer assets
    const candidates = [
      // When packaged, place icons under resourcesPath/resources/icon.png
      path.join(process.resourcesPath || '', 'resources', 'icon.png'),
      // When running from source
      path.join(__dirname, '../../resources/icon.png'),
      path.join(__dirname, '../../resources/icon@256.png'),
      path.join(__dirname, '../../resources/icon@128.png')
    ];
    for (const p of candidates) {
      try { if (p && fs.existsSync(p)) return p; } catch {}
    }
    return null;
  }

  private getIconNativeImage(): Electron.NativeImage | null {
    // Try bitmap first
    const p = this.getIconPath();
    if (p) {
      try {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) return img;
      } catch {}
    }
    // Fallback to bundled SVG in dev
    const svgCandidates = [
      path.join(__dirname, '../../public/sparkle.svg'),
      path.join(process.cwd(), 'public/sparkle.svg')
    ];
    for (const svgPath of svgCandidates) {
      try {
        if (fs.existsSync(svgPath)) {
          const svg = fs.readFileSync(svgPath, 'utf8');
          const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
          const img = nativeImage.createFromDataURL(dataUrl);
          if (!img.isEmpty()) return img;
        }
      } catch {}
    }
    return null;
  }

  private createMainWindow(_show: boolean = false) {
    const iconPath = this.getIconPath();
    const iconNative = this.getIconNativeImage();
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
        devTools: process.env.NODE_ENV === 'development',
        webSecurity: true,
        allowRunningInsecureContent: false,
        spellcheck: false
      },
      titleBarStyle: 'default',
      show: false,
      title: 'SparkleChase',
      // Used on Windows/Linux; ignored on macOS where the app bundle icon is used
      icon: (iconPath || iconNative || undefined) as any
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', async () => {
      // Set dock icon on macOS during development if present
      if (process.platform === 'darwin') {
        const devIcon = this.getIconNativeImage();
        if (devIcon) {
          try { app.dock.setIcon(devIcon); } catch {}
        }
      }
      // Wait for splash timing and (in prod) updater check
      if (process.env.NODE_ENV === 'development') {
        await new Promise((r) => setTimeout(r, 1200));
      } else {
        await this.finishSplash();
      }
      this.mainWindow?.show();
      this.splashWindow?.close();
      this.splashWindow = null;
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Setup local hotkeys for when app is focused
    this.setupLocalHotkeys();

    // Block navigation to external pages and open externally instead
    this.mainWindow.webContents.on('will-navigate', (e, url) => {
      if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
        e.preventDefault();
        try { shell.openExternal(url); } catch {}
      }
    });
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      try { shell.openExternal(url); } catch {}
      return { action: 'deny' };
    });
  }

  private createSplashWindow() {
    this.splashWindow = new BrowserWindow({
      width: 420,
      height: 240,
      frame: false,
      transparent: true,
      resizable: false,
      movable: true,
      alwaysOnTop: true,
      show: true,
      webPreferences: { nodeIntegration: false, contextIsolation: true, devTools: false }
    });

    if (process.env.NODE_ENV === 'development') {
      this.splashWindow.loadURL('http://localhost:5173/splash.html');
    } else {
      this.splashWindow.loadFile(path.join(__dirname, '../renderer/splash.html'));
    }
  }

  private async finishSplash() {
    // Ensure splash stays at least for a short time
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1200));
    const updater = (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { autoUpdater } = require('electron-updater');
        await autoUpdater.checkForUpdatesAndNotify();
      } catch {}
    })();
    await Promise.race([Promise.all([minDelay, updater])]);
  }

  private setupLocalHotkeys() {
    if (!this.mainWindow) return;

    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Handle local hotkeys when app is focused
      if (input.type === 'keyDown') {
        const globalEnabled = this.hotkeyManager.isGlobalEnabled();
        // Log key presses for debugging (can be removed in production)
        // console.log(`Key pressed: "${input.key}", global enabled: ${globalEnabled}`);

        // Only handle local hotkeys when global hotkeys are disabled
        if (!globalEnabled) {
          // If user is typing in an input/textarea/contentEditable, do not intercept
          if (this.typingActive) return;
          const settings = this.currentSettings;
          if (settings) {
            const inc = settings.hotkeys.increment || 'Space';
            const dec = settings.hotkeys.decrement || 'Backspace';
            const ph = settings.hotkeys.phase || 'CommandOrControl+P';

            const accel = acceleratorFromInput(input);
            if (accel === inc) {
              this.mainWindow?.webContents.send('hotkey:increment');
              event.preventDefault();
              return;
            }
            if (accel === dec) {
              this.mainWindow?.webContents.send('hotkey:decrement');
              event.preventDefault();
              return;
            }
            if (accel === ph) {
              this.mainWindow?.webContents.send('hotkey:phase');
              event.preventDefault();
              return;
            }
          }
        }
        
        // Prevent reload/devtools in production
        if (process.env.NODE_ENV !== 'development') {
          if ((input.key === 'F5') || (input.key.toLowerCase() === 'r' && (input.meta || input.control))) {
            event.preventDefault();
            return;
          }
          if ((input.key === 'F12') || ((input.meta || input.control) && input.shift && input.key.toLowerCase() === 'i')) {
            event.preventDefault();
            return;
          }
        }

        // Global toggle hotkey works regardless of global hotkey state
        const toggleAccel = (this.currentSettings?.hotkeys.toggleGlobal) || 'CommandOrControl+Shift+G';
        if (acceleratorFromInput(input) === toggleAccel) {
          const enabled = this.hotkeyManager.toggleGlobal();
          this.mainWindow?.webContents.send('hotkey:globalToggled', enabled);
          event.preventDefault();
        }
      }
    });
  }

  // Use shared accelerator converter

  private setupIpcHandlers() {
    // Hunt management
    ipcMain.handle('hunt:create', async (_, huntData) => {
      return await this.dataManager.createHunt(huntData);
    });

    ipcMain.handle('hunt:get', async (_, huntId) => {
      return await this.dataManager.getHunt(huntId);
    });

    ipcMain.handle('hunt:update', async (_, huntId, updates) => {
      return await this.dataManager.updateHunt(huntId, updates);
    });

    ipcMain.handle('hunt:delete', async (_, huntId) => {
      return await this.dataManager.deleteHunt(huntId);
    });

    ipcMain.handle('hunt:list', async () => {
      return await this.dataManager.listHunts();
    });

    // Typing state from renderer to avoid intercepting text input
    ipcMain.on('ui:typing', (_, active: boolean) => {
      this.typingActive = !!active;
    });

    // Counter operations
    ipcMain.handle('counter:increment', async (_, huntId) => {
      const hunt = await this.dataManager.incrementCounter(huntId);
      if (hunt) this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:decrement', async (_, huntId) => {
      const hunt = await this.dataManager.decrementCounter(huntId);
      if (hunt) this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:setCount', async (_, huntId, count) => {
      const hunt = await this.dataManager.setCounter(huntId, count);
      if (hunt) this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    // Phase operations
    ipcMain.handle('phase:add', async (_, huntId, phaseData) => {
      return await this.dataManager.addPhase(huntId, phaseData);
    });
    ipcMain.handle('phase:delete', async (_, huntId, phaseId) => {
      const hunt = await this.dataManager.removePhase(huntId, phaseId);
      if (hunt) this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    // Settings
    ipcMain.handle('settings:get', async () => {
      return await this.dataManager.getSettings();
    });

    ipcMain.handle('settings:update', async (_, updates) => {
      const updated = await this.dataManager.updateSettings(updates);
      this.currentSettings = updated;
      await this.configureHotkeys(updated);
      return updated;
    });

    // File operations
    ipcMain.handle('file:selectFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('file:export', async (_, data) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        filters: [{ name: 'Shiny Counter Data', extensions: ['shiny.json'] }]
      });
      if (!result.canceled && result.filePath) {
        return await this.dataManager.exportData(result.filePath, data);
      }
      return false;
    });

    ipcMain.handle('file:import', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        filters: [{ name: 'Shiny Counter Data', extensions: ['shiny.json'] }],
        properties: ['openFile']
      });
      if (!result.canceled && result.filePaths[0]) {
        return await this.dataManager.importData(result.filePaths[0]);
      }
      return null;
    });

    // Overlay management
    ipcMain.handle('overlay:toggle', async () => {
      return this.overlayManager.toggle();
    });

    ipcMain.handle('overlay:show', async () => {
      return this.overlayManager.show();
    });

    ipcMain.handle('overlay:hide', async () => {
      return this.overlayManager.hide();
    });

    // Hotkey management
    ipcMain.handle('hotkey:toggleGlobal', async () => {
      return this.hotkeyManager.toggleGlobal();
    });

    // Diagnostic and testing
    ipcMain.handle('diagnostic:testDataIntegrity', async () => {
      return await this.dataManager.testDataIntegrity();
    });

    ipcMain.handle('diagnostic:createBackup', async () => {
      return await this.dataManager.createEmergencyBackup();
    });

    ipcMain.handle('diagnostic:getDataDirectory', async () => {
      return await this.dataManager.getDataDirectory();
    });

    ipcMain.handle('diagnostic:validateOBSFolder', async (_, folderPath) => {
      return await this.dataManager.validateOBSFolder(folderPath);
    });

    // App
    ipcMain.handle('app:getVersion', async () => {
      return app.getVersion();
    });
  }

  private async setupHotkeys() {
    const settings = await this.dataManager.getSettings();
    this.currentSettings = settings;
    await this.configureHotkeys(settings);
  }

  private async configureHotkeys(settings: Settings) {
    this.hotkeyManager.unregisterAll();
    this.hotkeyManager.setSafeModeApps(settings.safeModeApps);

    // Register hotkeys with guards to avoid interfering while typing in the app
    this.hotkeyManager.registerHotkey(settings.hotkeys.increment || 'Space', () => {
      // If the app window is focused and the user is typing, ignore
      if (this.mainWindow?.isFocused() && this.typingActive) return;
      this.mainWindow?.webContents.send('hotkey:increment');
    });

    this.hotkeyManager.registerHotkey(settings.hotkeys.decrement || 'Backspace', () => {
      if (this.mainWindow?.isFocused() && this.typingActive) return;
      this.mainWindow?.webContents.send('hotkey:decrement');
    });

    this.hotkeyManager.registerHotkey(settings.hotkeys.phase || 'CommandOrControl+P', () => {
      if (this.mainWindow?.isFocused() && this.typingActive) return;
      this.mainWindow?.webContents.send('hotkey:phase');
    });

    this.hotkeyManager.registerHotkey(settings.hotkeys.toggleGlobal || 'CommandOrControl+Shift+G', () => {
      const enabled = this.hotkeyManager.toggleGlobal();
      this.mainWindow?.webContents.send('hotkey:globalToggled', enabled);
    });

    // Enable global hotkeys if setting is enabled
    if (settings.globalHotkeysEnabled) {
      const enabled = this.hotkeyManager.toggleGlobal();
      this.mainWindow?.webContents.send('hotkey:globalToggled', enabled);
    }
  }
}

// Initialize the app
const shinyCounterApp = new ShinyCounterApp();
shinyCounterApp.initialize().catch(console.error);
