import { app, BrowserWindow, globalShortcut, ipcMain, dialog, Menu, shell } from 'electron';
import * as path from 'path';
import { DataManager } from './data/DataManager';
import { HotkeyManager } from './hotkeys/HotkeyManager';
import { OverlayManager } from './overlay/OverlayManager';
import { Settings } from '../shared/types';

class ShinyCounterApp {
  private mainWindow: BrowserWindow | null = null;
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
    await app.whenReady();
    
    // Initialize data manager
    await this.dataManager.initialize();
    
    // Harden app menu in production
    if (process.env.NODE_ENV !== 'development') {
      try { Menu.setApplicationMenu(null); } catch {}
    }

    // Create main window
    this.createMainWindow();
    
    // Setup IPC handlers
    this.setupIpcHandlers();
    
    // Setup hotkeys
    this.setupHotkeys();

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

  private createMainWindow() {
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
      show: false
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
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
            const dec = settings.hotkeys.decrement || 'CommandOrControl+Z';
            const ph = settings.hotkeys.phase || 'CommandOrControl+P';

            const accel = this.acceleratorFromInput(input);
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
        if (this.acceleratorFromInput(input) === toggleAccel) {
          const enabled = this.hotkeyManager.toggleGlobal();
          this.mainWindow?.webContents.send('hotkey:globalToggled', enabled);
          event.preventDefault();
        }
      }
    });
  }

  // Convert before-input-event payload into an Accelerator-like string consistent with SettingsDialog
  private acceleratorFromInput(input: Electron.Input): string {
    const parts: string[] = [];
    if (input.meta || input.control) parts.push('CommandOrControl');
    if (input.alt) parts.push('Alt');
    if (input.shift) parts.push('Shift');

    let key = input.key;
    if (key === ' ') key = 'Space';
    if (key && key.length === 1) key = key.toUpperCase();
    parts.push(key);
    return parts.join('+');
  }

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
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:decrement', async (_, huntId) => {
      const hunt = await this.dataManager.decrementCounter(huntId);
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:setCount', async (_, huntId, count) => {
      const hunt = await this.dataManager.setCounter(huntId, count);
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    // Phase operations
    ipcMain.handle('phase:add', async (_, huntId, phaseData) => {
      return await this.dataManager.addPhase(huntId, phaseData);
    });
    ipcMain.handle('phase:delete', async (_, huntId, phaseId) => {
      const hunt = await this.dataManager.removePhase(huntId, phaseId);
      this.overlayManager.updateOverlay(hunt as any);
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

    this.hotkeyManager.registerHotkey(settings.hotkeys.decrement || 'CommandOrControl+Z', () => {
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
